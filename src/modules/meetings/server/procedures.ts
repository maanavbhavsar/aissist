import {createTRPCRouter, protectedProcedure} from "@/trpc/init";
import {db} from "@/db";
import {meeting} from "@/db/schema";
import {z} from "zod";
import { eq, and, like, desc, count } from "drizzle-orm";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MIN_PAGE_SIZE, MAX_PAGE_SIZE } from "@/constants";
import { TRPCError } from "@trpc/server";

export const meetingsRouter = createTRPCRouter({
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
        }).from(meeting).where(and(eq(meeting.id, input.id), eq(meeting.userId, ctx.auth.user.id)));
        if (!existingMeeting) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Meeting not found" });
        }
        return existingMeeting;
    }),
    getMany: protectedProcedure.input(z.object({
        page: z.number().default(DEFAULT_PAGE),
        pageSize: z.number().min(MIN_PAGE_SIZE).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
        search: z.string().optional(),
    })).query(async ({ input, ctx }) => {
        const { page, pageSize, search } = input;
        
        const whereConditions = [
            eq(meeting.userId, ctx.auth.user.id)
        ];
        
        if (search) {
            whereConditions.push(like(meeting.name, `%${search}%`));
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
        })
        .from(meeting)
        .where(and(...whereConditions))
        .orderBy(desc(meeting.createdAt), desc(meeting.id))
        .limit(pageSize)
        .offset((page - 1) * pageSize);
        
        const [totalResult] = await db.select({ count: count() })
        .from(meeting)
        .where(and(...whereConditions));
        
        const totalPages = Math.ceil(totalResult.count / pageSize);
        
        return {
            items: data,
            total: totalResult.count,
            totalPages,
        };
    }),
});
