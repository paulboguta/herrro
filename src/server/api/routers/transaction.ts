
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { transactions } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const transactionRouter = createTRPCRouter({
    // create: publicProcedure
    // .input(z.object({ name: z.string().min(1) }))
    // .mutation(async ({ ctx, input }) => {
    //   await ctx.db.insert(posts).values({
    //     name: input.name,
    //   });
    // }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.db.query.transactions.findMany({
      orderBy: (transactions, { desc }) => [desc(transactions.createdAt)],
    });

    return result ?? null;
  }),

  getByAccountId: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const result = await ctx.db.query.transactions.findMany({
      where: eq(transactions.account, input),
      orderBy: (transactions, { desc }) => [desc(transactions.createdAt)],
    });

    return result ?? null;
  }),
});

