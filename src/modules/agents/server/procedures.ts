import {createTRPCRouter, protectedProcedure} from "@/trpc/init";
import {db} from "@/db";
import{agent, meeting} from "@/db/schema";
import {agentsInsertSchema, agentsUpdateSchema} from "../schemas";
import {z} from "zod";
import { eq, and, like, desc, count } from "drizzle-orm";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MIN_PAGE_SIZE, MAX_PAGE_SIZE } from "@/constants";
import { nanoid } from "nanoid";
import { TRPCError } from "@trpc/server";

export const agentsRouter = createTRPCRouter({
    getOne: protectedProcedure.input(z.object({
        id: z.string(),
    })).query(async ({input, ctx}) => {
        const [existingAgent] = await db.select({
            id: agent.id,
            name: agent.name,
            instructions: agent.instructions,
            userId: agent.userId,
            createdAt: agent.createdAt,
            updatedAt: agent.updatedAt,
        }).from(agent).where(and(eq(agent.id, input.id), eq(agent.userId, ctx.auth.user.id)));
        if (!existingAgent) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Agent not found" });
        }

        const [meetingCountResult] = await db.select({ count: count() })
            .from(meeting)
            .where(eq(meeting.agentId, existingAgent.id));

        return {
            ...existingAgent,
            meetingCount: meetingCountResult.count
        };
    }),
    getMany: protectedProcedure.input(z.object({
        page: z.number().default(DEFAULT_PAGE),
        pageSize: z.number().min(MIN_PAGE_SIZE).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
        search: z.string().optional(),
        shouldFilter: z.boolean().optional().default(true),
    })).query(async ({ input, ctx }) => {
        const { page, pageSize, search } = input;
        
        const whereConditions = [
            eq(agent.userId, ctx.auth.user.id)
        ];
        
        if (search) {
            whereConditions.push(like(agent.name, `%${search}%`));
        }
        
        const data = await db.select({
            id: agent.id,
            name: agent.name,
            instructions: agent.instructions,
            userId: agent.userId,
            createdAt: agent.createdAt,
            updatedAt: agent.updatedAt,
        })
        .from(agent)
        .where(and(...whereConditions))
        .orderBy(desc(agent.createdAt), desc(agent.id))
        .limit(pageSize)
        .offset((page - 1) * pageSize);

        // Get meeting counts for each agent
        const agentsWithMeetingCounts = await Promise.all(
            data.map(async (agentData) => {
                const [meetingCountResult] = await db.select({ count: count() })
                    .from(meeting)
                    .where(eq(meeting.agentId, agentData.id));
                
                return {
                    ...agentData,
                    meetingCount: meetingCountResult.count
                };
            })
        );
        
        const [totalResult] = await db.select({ count: count() })
        .from(agent)
        .where(and(...whereConditions));
        
        const totalPages = Math.ceil(totalResult.count / pageSize);
        
        return {
            items: agentsWithMeetingCounts,
            total: totalResult.count,
            totalPages,
        };
    }),
    create: protectedProcedure.input(agentsInsertSchema).mutation(async ({input, ctx}) => {
        try {
            const [createdAgent] = await db.insert(agent).values({
                id: nanoid(),
                ...input,
                userId: ctx.auth.user.id,
            }).returning();
            
            return createdAgent;
        } catch (error) {
            console.error("Database error creating agent:", error);
            throw new Error(`Failed to create agent: ${error instanceof Error ? error.message : "Database error"}`);
        }
    }),
    remove: protectedProcedure.input(z.object({
        id: z.string(),
    })).mutation(async ({input, ctx}) => {
        const [removedAgent] = await db.delete(agent).where(
            and(eq(agent.id, input.id), eq(agent.userId, ctx.auth.user.id))
        ).returning();
        
        if (!removedAgent) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Agent not found" });
        }
        
        return removedAgent;
    }),
    update: protectedProcedure.input(agentsUpdateSchema).mutation(async ({input, ctx}) => {
        const [updatedAgent] = await db.update(agent).set(input).where(
            and(eq(agent.id, input.id), eq(agent.userId, ctx.auth.user.id))
        ).returning();
        
        if (!updatedAgent) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Agent not found" });
        }
        
        return updatedAgent;
    }),
});