import {createTRPCRouter, protectedProcedure} from "@/trpc/init";
import {db} from "@/db";
import {meeting, agent} from "@/db/schema";
import {meetingsInsertSchema, meetingsUpdateSchema} from "../schemas";
import {z} from "zod";
import { eq, and, like, desc, count, sql } from "drizzle-orm";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MIN_PAGE_SIZE, MAX_PAGE_SIZE } from "@/constants";
import { nanoid } from "nanoid";
import { TRPCError } from "@trpc/server";
import { MeetingStatus } from "../types";

export const meetingsRouter = createTRPCRouter({
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
            
            const [createdMeeting] = await db.insert(meeting).values({
                id: nanoid(),
                ...input,
                userId: ctx.auth.user.id,
            }).returning();
            
            console.log("Meeting created successfully:", createdMeeting);
            return createdMeeting;
            // TODO: call upsert stream users for video call SDK
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
});
