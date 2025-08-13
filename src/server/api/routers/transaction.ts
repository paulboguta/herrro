import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { transaction_table } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const transactionRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        account: z.string().uuid(),
        date: z.string().min(1),
        type: z.enum(["income", "expense", "transfer"]),
        amount: z.string().min(1),
        currency: z.string().min(1).default("USD"),
        category: z.string().min(1),
        description: z.string().optional().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(transaction_table).values({
        account: input.account,
        ownerId: ctx.auth.userId,
        date: new Date(input.date),
        type: input.type,
        amount: input.amount,
        currency: input.currency ?? "USD",
        category: input.category,
        description: input.description ?? null,
      });
      return { success: true };
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    const result = await ctx.db.query.transaction_table.findMany({
      orderBy: (transactions, { desc }) => [desc(transactions.createdAt)],
    });

    return result ?? null;
  }),

  getByAccountId: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const result = await ctx.db.query.transaction_table.findMany({
        where: eq(transaction_table.account, input),
        orderBy: (transactions, { desc }) => [desc(transactions.createdAt)],
      });

      return result ?? null;
    }),
});
