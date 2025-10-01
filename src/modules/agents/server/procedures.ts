import {createTRPCRouter, protectedProcedure} from "@/trpc/init";
import {db} from "@/db";
import{agent} from "@/db/schema";
import {agentsInsertSchema} from "../schemas";
import {z} from "zod";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";

export const agentsRouter = createTRPCRouter({
    getOne: protectedProcedure.input(z.object({
        id: z.string(),
    })).query(async ({input}) => {
        const [existingAgent] = await db.select({
            ...agent,
            meetingCount: sql<number>`5`.as('meetingCount')
        }).from(agent).where(eq(agent.id, input.id));
        return existingAgent;
    }),
    getMany: protectedProcedure.query(async () => {
        const data = await db.select({
            ...agent,
            meetingCount: sql<number>`5`.as('meetingCount')
        }).from(agent);
        return data;
    }),
    create: protectedProcedure.input(agentsInsertSchema).mutation(async ({input, ctx}) => {
        const [createdAgent] = await db.insert(agent).values({
            ...input,
            userId: ctx.auth.user.id,
        }).returning();
        return createdAgent;
    }),
});