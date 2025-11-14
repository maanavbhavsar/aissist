import {createTRPCRouter, protectedProcedure} from "@/trpc/init";
import {db} from "@/db";
import {meeting, agent, user} from "@/db/schema";
import {meetingsInsertSchema, meetingsUpdateSchema} from "../schemas";
import {z} from "zod";
import { eq, and, like, desc, count, sql, inArray } from "drizzle-orm";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MIN_PAGE_SIZE, MAX_PAGE_SIZE, UNRESTRICTED_EMAILS } from "@/constants";
import { nanoid } from "nanoid";
import { TRPCError } from "@trpc/server";
import { MeetingStatus } from "../types";
import { StreamTranscriptItem } from "../types";
import { streamVideo } from "@/lib/stream-video";
import { generateAvatarURI } from "@/lib/avatar";
import { streamChatClient } from "@/lib/stream-chat";
import JSONL from 'jsonl-parse-stringify';

export const meetingsRouter = createTRPCRouter({
    generateToken: protectedProcedure.mutation(async ({ ctx }) => {
        console.log(`🔄 Generating token for user: ${ctx.auth.user.id}`);
        
        // Upsert the logged-in user in Stream
        try {
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
            console.log(`✅ User upserted successfully: ${ctx.auth.user.id}`);
        } catch (error) {
            console.error(`❌ Failed to upsert user:`, error);
            throw new Error(`Failed to upsert user: ${error}`);
        }

        // Generate Stream token
        const exp = Math.floor(Date.now() / 1000) + 60 * 60; // 1 hour expiry
        const iat = Math.floor(Date.now() / 1000);
        const token = streamVideo.generateUserToken({
            user_id: ctx.auth.user.id,
            exp,
            iat,
        });

        console.log(`✅ Token generated successfully for user: ${ctx.auth.user.id}`);
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

            // Create Stream call with retry mechanism
            const call = streamVideo.video.call('default', createdMeeting.id);
            let callCreated = false;
            let retryCount = 0;
            const maxRetries = 3;
            
            while (!callCreated && retryCount < maxRetries) {
                try {
                    console.log(`🔄 Creating Stream call (attempt ${retryCount + 1}/${maxRetries}) for meeting ${createdMeeting.id}`);
                    
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
                                video: { 
                                    camera_default_on: true, 
                                    camera_facing: 'front',
                                    target_resolution: {
                                        width: 1280,
                                        height: 720,
                                        bitrate: 2500
                                    }
                                },
                            },
                        },
                    });
                    
                    // Verify the call was created successfully by checking its state
                    const callState = await call.get();
                    if (!callState) {
                        throw new Error('Call creation verification failed');
                    }
                    
                    type CallStateType = { 
                        id?: string; 
                        created_by_id?: string; 
                        custom?: unknown; 
                        state?: { participants?: unknown[] }; 
                        call?: { 
                            id?: string; 
                            created_by_id?: string; 
                            custom?: unknown; 
                            state?: { participants?: unknown[] } 
                        } 
                    };
                    const state = callState as unknown as CallStateType;
                    console.log(`✅ Stream call created and verified successfully for meeting ${createdMeeting.id}`);
                    console.log(`📊 Call state:`, {
                        id: state?.id || state?.call?.id,
                        created_by_id: state?.created_by_id || state?.call?.created_by_id,
                        custom: state?.custom || state?.call?.custom,
                        state: state?.state || state?.call?.state,
                        participants: state?.state?.participants?.length || state?.call?.state?.participants?.length || 0
                    });
                    
                    callCreated = true;
                } catch (error) {
                    retryCount++;
                    console.error(`❌ Failed to create Stream call (attempt ${retryCount}/${maxRetries}) for meeting ${createdMeeting.id}:`, error);
                    
                    if (retryCount >= maxRetries) {
                        throw new Error(`Failed to create Stream call after ${maxRetries} attempts: ${error}`);
                    }
                    
                    // Wait before retrying
                    await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
                }
            }

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
        shouldFilter: z.boolean().optional().default(true),
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
            duration: sql<number>`CASE 
                WHEN ${meeting.endedAt} IS NOT NULL AND ${meeting.startedAt} IS NOT NULL 
                THEN EXTRACT(EPOCH FROM (${meeting.endedAt} - ${meeting.startedAt}))::BIGINT * 1000
                ELSE 0
            END`.as('duration'),
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
            try {
                // 1) fetch meeting and check access
                const [existingMeeting] = await db.select()
                    .from(meeting)
                    .where(and(eq(meeting.id, input.id), eq(meeting.userId, ctx.auth.user.id)));

                if (!existingMeeting) {
                    throw new TRPCError({ code: 'NOT_FOUND', message: 'Meeting not found' })
                }
                
                if (!existingMeeting.transcriptUrl) {
                    return []
                }

                // 2) fetch transcript file (JSONL)
                let transcriptItems: StreamTranscriptItem[] = []
                try {
                    const res = await fetch(existingMeeting.transcriptUrl)
                    if (!res.ok) {
                        console.error(`❌ Failed to fetch transcript: ${res.status} ${res.statusText}`)
                        return []
                    }
                    const text = await res.text()
                    if (!text || text.trim() === '') {
                        console.warn(`⚠️ Transcript file is empty for meeting ${input.id}`)
                        return []
                    }
                    transcriptItems = JSONL.parse(text)
                } catch (err) {
                    console.error(`❌ Error parsing transcript for meeting ${input.id}:`, err)
                    return []
                }

                // 3) collect unique speaker IDs
                const speakerIds = Array.from(new Set(transcriptItems.map((it) => it.speaker_id).filter(Boolean)))

                // 4) load user speakers
                const userSpeakers = speakerIds.length > 0 ? await db.select()
                    .from(user)
                    .where(inArray(user.id, speakerIds)) : []

                // 5) load agent speakers (agents table)
                const agentSpeakers = speakerIds.length > 0 ? await db.select()
                    .from(agent)
                    .where(inArray(agent.id, speakerIds)) : []

                // 6) normalize speakers into map
                const speakersMap = new Map<string, { id: string; name: string; image: string | null }>()
                userSpeakers.forEach((u) => {
                    speakersMap.set(u.id, { id: u.id, name: u.name ?? 'Unknown', image: u.image ?? null })
                })
                agentSpeakers.forEach((a) => {
                    speakersMap.set(a.id, { id: a.id, name: a.name ?? 'Agent', image: null })
                })

                // 7) map transcript items to include speaker info and meeting start time
                const transcriptWithSpeakers = transcriptItems.map((item) => {
                    const sid = item.speaker_id
                    if (!sid || !speakersMap.has(sid)) {
                        return {
                            ...item,
                            speaker: { id: 'unknown', name: 'Unknown', image: generateAvatarURI({ seed: 'unknown', variant: 'initials' }) },
                            meetingStartedAt: existingMeeting.startedAt?.toISOString() ?? null,
                        }
                    }
                    const sp = speakersMap.get(sid)!
                    return { 
                        ...item, 
                        speaker: { id: sp.id, name: sp.name, image: sp.image ?? generateAvatarURI({ seed: sp.name, variant: 'initials' }) },
                        meetingStartedAt: existingMeeting.startedAt?.toISOString() ?? null,
                    }
                })

                return transcriptWithSpeakers
            } catch (error) {
                console.error(`❌ Error in getTranscript for meeting ${input.id}:`, error)
                if (error instanceof TRPCError) {
                    throw error
                }
                throw new TRPCError({ 
                    code: 'INTERNAL_SERVER_ERROR', 
                    message: error instanceof Error ? error.message : 'Failed to fetch transcript' 
                })
            }
        }),
    generateChatToken: protectedProcedure
        .mutation(async ({ ctx }) => {
            try {
                // Check if secret key is configured
                const secretKey = process.env.STREAM_CHAT_SECRET_KEY
                if (!secretKey) {
                    console.error('❌ STREAM_CHAT_SECRET_KEY is missing from environment')
                    console.error('📊 Available STREAM env vars:', Object.keys(process.env).filter(k => k.includes('STREAM')))
                    throw new TRPCError({ 
                        code: 'INTERNAL_SERVER_ERROR', 
                        message: 'STREAM_CHAT_SECRET_KEY environment variable is not set. Chat token generation requires this key.' 
                    })
                }

                const userId = ctx.auth.user.id
                const userName = ctx.auth.user.name ?? 'User'
                const image = ctx.auth.user.image ?? generateAvatarURI({ seed: userName, variant: 'initials' })

                console.log(`🔄 Generating chat token for user: ${userId}`)
                console.log(`📊 Secret key present: ${!!secretKey}, length: ${secretKey.length}`)

                // upsert user if needed — stream chat has server methods for user creation
                try {
                    await streamChatClient.upsertUser({
                        id: userId,
                        name: userName,
                        image,
                        role: 'admin',
                    })
                    console.log(`✅ User upserted successfully: ${userId}`)
                } catch (upsertError) {
                    console.error(`❌ Error upserting user:`, upsertError)
                    // Continue anyway - token generation might still work
                }

                // Create token - requires secret key to be set in streamChatClient initialization
                // Check if the client has the secret configured
                if (!secretKey) {
                    throw new TRPCError({ 
                        code: 'INTERNAL_SERVER_ERROR', 
                        message: 'Stream Chat client not initialized with secret key' 
                    })
                }

                const token = streamChatClient.createToken(userId)
                if (!token) {
                    throw new TRPCError({ 
                        code: 'INTERNAL_SERVER_ERROR', 
                        message: 'Failed to generate chat token. The token was null or undefined.' 
                    })
                }

                console.log(`✅ Chat token generated successfully for user: ${userId}`)
                return token
            } catch (error) {
                console.error('❌ Error generating chat token:', error)
                console.error('❌ Error details:', {
                    message: error instanceof Error ? error.message : String(error),
                    stack: error instanceof Error ? error.stack : undefined,
                    hasSecretKey: !!process.env.STREAM_CHAT_SECRET_KEY,
                })
                if (error instanceof TRPCError) {
                    throw error
                }
                throw new TRPCError({ 
                    code: 'INTERNAL_SERVER_ERROR', 
                    message: error instanceof Error ? error.message : 'Failed to generate chat token' 
                })
            }
        }),
    checkMeetingLimit: protectedProcedure
        .query(async ({ ctx }) => {
            const MAX_FREE_MEETINGS = 3;

            const userId = ctx.auth.user.id;
            const userEmail = ctx.auth.user.email;

            // Unrestricted users bypass all checks
            if (userEmail && UNRESTRICTED_EMAILS.includes(userEmail)) {
                return { canProceed: true, isUnlimited: true };
            }

            // Count total meetings created by this user
            const [meetingCount] = await db
                .select({ count: count() })
                .from(meeting)
                .where(eq(meeting.userId, userId));

            const currentCount = meetingCount?.count || 0;

            if (currentCount >= MAX_FREE_MEETINGS) {
                return {
                    canProceed: false,
                    isUnlimited: false,
                    used: currentCount,
                    limit: MAX_FREE_MEETINGS,
                };
            }

            return {
                canProceed: true,
                isUnlimited: false,
                used: currentCount,
                limit: MAX_FREE_MEETINGS,
            };
        }),
});
