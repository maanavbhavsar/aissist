import {createTRPCRouter, protectedProcedure} from "@/trpc/init";
import {db} from "@/db";
import {meeting, agent, user} from "@/db/schema";
import {meetingsInsertSchema, meetingsUpdateSchema} from "../schemas";
import {z} from "zod";
import { eq, and, like, desc, count, sql } from "drizzle-orm";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MIN_PAGE_SIZE, MAX_PAGE_SIZE, UNRESTRICTED_EMAILS } from "@/constants";
import { nanoid } from "nanoid";
import { TRPCError } from "@trpc/server";
import { MeetingStatus } from "../types";
import { streamVideo } from "@/lib/stream-video";
import { generateAvatarURI } from "@/lib/avatar";
import { streamChatClient } from "@/lib/stream-chat";
import JSONL from 'jsonl-parse-stringify';

export const meetingsRouter = createTRPCRouter({
    generateToken: protectedProcedure.mutation(async ({ ctx }) => {
        // Upsert the logged-in user in Stream
        await streamVideo.upsertUsers([
            {
                id: ctx.auth.user.id,
                name: ctx.auth.user.name,
                role: 'admin',
                image: ctx.auth.user.image ?? generateAvatarURI({
                    seed: ctx.auth.user.name,
                    variant: 'initials',
                }),
            },
        ]);

        // Generate Stream token
        const exp = Math.floor(Date.now() / 1000) + 60 * 60; // 1 hour expiry
        const iat = Math.floor(Date.now() / 1000);
        const token = streamVideo.generateUserToken({
            user_id: ctx.auth.user.id,
            exp,
            iat,
        });

        return token;
    }),
    update: protectedProcedure.input(meetingsUpdateSchema).mutation(async ({input, ctx}) => {
        const [updatedMeeting] = await db.update(meeting).set(input).where(
            and(eq(meeting.id, input.id), eq(meeting.userId, ctx.auth.user.id))
        ).returning();
        
        if (!updatedMeeting) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Meeting not found" });
        }
        
        return updatedMeeting;
    }),
    remove: protectedProcedure.input(z.object({
        id: z.string(),
    })).mutation(async ({input, ctx}) => {
        const [removedMeeting] = await db.delete(meeting).where(
            and(eq(meeting.id, input.id), eq(meeting.userId, ctx.auth.user.id))
        ).returning();
        
        if (!removedMeeting) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Meeting not found" });
        }
        
        return removedMeeting;
    }),
    create: protectedProcedure.input(meetingsInsertSchema).mutation(async ({input, ctx}) => {
        try {
            console.log("Creating meeting with input:", input);
            console.log("User ID:", ctx.auth.user.id);
            
            // Check meeting limit for non-unrestricted users
            const [userData] = await db.select().from(user).where(eq(user.id, ctx.auth.user.id));
            if (!userData?.email || !UNRESTRICTED_EMAILS.includes(userData.email)) {
                const [meetingCount] = await db.select({ count: count() })
                    .from(meeting)
                    .where(eq(meeting.userId, ctx.auth.user.id));
                
                if (meetingCount.count >= 3) {
                    throw new TRPCError({ 
                        code: "FORBIDDEN", 
                        message: "You have reached the maximum limit of 3 meetings." 
                    });
                }
            }
            
            const [createdMeeting] = await db.insert(meeting).values({
                id: nanoid(),
                ...input,
                userId: ctx.auth.user.id,
            }).returning();
            
            console.log("Meeting created successfully:", createdMeeting);

            // Create Stream call
            const call = streamVideo.video.call('default', createdMeeting.id);
            await call.create({
                data: {
                    created_by_id: ctx.auth.user.id,
                    custom: {
                        meeting_id: createdMeeting.id,
                        meeting_name: createdMeeting.name,
                    },
                    settings_override: {
                        transcription: { mode: 'auto-on', closed_caption_mode: 'auto-on', language: 'en' },
                        recording: { mode: 'auto-on', quality: '1080p' },
                    },
                },
            });

            // Fetch the agent from database
            const [meetingAgent] = await db.select().from(agent).where(eq(agent.id, createdMeeting.agentId)).limit(1);
            if (!meetingAgent) throw new Error('Agent not found');

            // Upsert the agent user in Stream
            await streamVideo.upsertUsers([
                {
                    id: meetingAgent.id,
                    name: meetingAgent.name,
                    role: 'user',
                    image: generateAvatarURI({
                        seed: meetingAgent.name,
                        variant: 'botttsNeutral',
                    }),
                },
            ]);

            return createdMeeting;
        } catch (error) {
            console.error("Database error creating meeting:", error);
            throw new Error(`Failed to create meeting: ${error instanceof Error ? error.message : "Database error"}`);
        }
    }),
    getOne: protectedProcedure.input(z.object({
        id: z.string(),
    })).query(async ({input, ctx}) => {
        const [existingMeeting] = await db.select({
            id: meeting.id,
            name: meeting.name,
            userId: meeting.userId,
            agentId: meeting.agentId,
            status: meeting.status,
            startedAt: meeting.startedAt,
            endedAt: meeting.endedAt,
            transcriptUrl: meeting.transcriptUrl,
            recordingUrl: meeting.recordingUrl,
            summary: meeting.summary,
            createdAt: meeting.createdAt,
            updatedAt: meeting.updatedAt,
            agent: {
                id: agent.id,
                name: agent.name,
            },
        }).from(meeting)
        .innerJoin(agent, eq(meeting.agentId, agent.id))
        .where(and(eq(meeting.id, input.id), eq(meeting.userId, ctx.auth.user.id)));
        if (!existingMeeting) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Meeting not found" });
        }
        return existingMeeting;
    }),
    getMany: protectedProcedure.input(z.object({
        page: z.number().default(DEFAULT_PAGE),
        pageSize: z.number().min(MIN_PAGE_SIZE).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
        search: z.string().optional(),
        agentId: z.string().nullish(),
        status: z.nativeEnum(MeetingStatus).nullish(),
    })).query(async ({ input, ctx }) => {
        const { page, pageSize, search, status, agentId } = input;
        
        const whereConditions = [
            eq(meeting.userId, ctx.auth.user.id)
        ];
        
        if (search) {
            whereConditions.push(like(meeting.name, `%${search}%`));
        }

        if (status) {
            whereConditions.push(eq(meeting.status, status));
        }

        if (agentId) {
            whereConditions.push(eq(meeting.agentId, agentId));
        }
        
        const data = await db.select({
            id: meeting.id,
            name: meeting.name,
            userId: meeting.userId,
            agentId: meeting.agentId,
            status: meeting.status,
            startedAt: meeting.startedAt,
            endedAt: meeting.endedAt,
            transcriptUrl: meeting.transcriptUrl,
            recordingUrl: meeting.recordingUrl,
            summary: meeting.summary,
            createdAt: meeting.createdAt,
            updatedAt: meeting.updatedAt,
            agent: {
                id: agent.id,
                name: agent.name,
            },
            duration: sql<number>`extract(epoch from (${meeting.endedAt} - ${meeting.startedAt}))`.as('duration'),
        })
        .from(meeting)
        .innerJoin(agent, eq(meeting.agentId, agent.id))
        .where(and(...whereConditions))
        .orderBy(desc(meeting.createdAt), desc(meeting.id))
        .limit(pageSize)
        .offset((page - 1) * pageSize);
        
        const [totalResult] = await db.select({ count: count() })
        .from(meeting)
        .innerJoin(agent, eq(meeting.agentId, agent.id))
        .where(and(...whereConditions));
        
        const totalPages = Math.ceil(totalResult.count / pageSize);
        
        return {
            items: data,
            total: totalResult.count,
            totalPages,
        };
    }),
    getTranscript: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            // 1) fetch meeting and check access
            const [existingMeeting] = await db.select()
                .from(meeting)
                .where(and(eq(meeting.id, input.id), eq(meeting.userId, ctx.auth.user.id)));

            if (!existingMeeting) throw new TRPCError({ code: 'NOT_FOUND', message: 'Meeting not found' })
            if (!existingMeeting.transcriptUrl) return []

            // 2) fetch transcript file (JSONL)
            let transcriptItems: any[] = []
            try {
                const res = await fetch(existingMeeting.transcriptUrl)
                if (!res.ok) return []
                const text = await res.text()
                transcriptItems = JSONL.parse(text)
            } catch (err) {
                return []
            }

            // 3) collect unique speaker IDs
            const speakerIds = Array.from(new Set(transcriptItems.map((it) => it.speaker_id).filter(Boolean)))

            // 4) load user speakers
            const userSpeakers = speakerIds.length > 0 ? await db.select()
                .from(user)
                .where(sql`${user.id} = ANY(${speakerIds})`) : []

            // 5) load agent speakers (agents table)
            const agentSpeakers = speakerIds.length > 0 ? await db.select()
                .from(agent)
                .where(sql`${agent.id} = ANY(${speakerIds})`) : []

            // 6) normalize speakers into map
            const speakersMap = new Map<string, { id: string; name: string; image: string | null }>()
            userSpeakers.forEach((u) => {
                speakersMap.set(u.id, { id: u.id, name: u.name ?? 'Unknown', image: u.image ?? null })
            })
            agentSpeakers.forEach((a) => {
                speakersMap.set(a.id, { id: a.id, name: a.name ?? 'Agent', image: null })
            })

            // 7) map transcript items to include speaker info
            const transcriptWithSpeakers = transcriptItems.map((item) => {
                const sid = item.speaker_id
                if (!sid || !speakersMap.has(sid)) {
                    return {
                        ...item,
                        speaker: { id: 'unknown', name: 'Unknown', image: generateAvatarURI({ seed: 'unknown', variant: 'initials' }) },
                    }
                }
                const sp = speakersMap.get(sid)!
                return { ...item, speaker: { id: sp.id, name: sp.name, image: sp.image ?? generateAvatarURI({ seed: sp.name, variant: 'initials' }) } }
            })

            return transcriptWithSpeakers
        }),
    generateChatToken: protectedProcedure
        .mutation(async ({ ctx }) => {
            const userId = ctx.auth.user.id
            const userName = ctx.auth.user.name ?? 'User'
            const image = ctx.auth.user.image ?? generateAvatarURI({ seed: userName, variant: 'initials' })

            // upsert user if needed — stream chat has server methods for user creation
            await streamChatClient.upsertUser({
                id: userId,
                name: userName,
                image,
                role: 'admin',
            })

            const token = streamChatClient.createToken(userId)
            return token
        }),
});
