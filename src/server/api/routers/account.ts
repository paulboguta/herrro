import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { account_table } from "@/server/db/schema";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

export const accountRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .insert(account_table)
        .values({ name: input.name, ownerId: ctx.auth.userId })
      return { success: true };
    }),

  getById: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const account = await ctx.db.query.account_table.findFirst({
        where: and(
          eq(account_table.id, input),
          eq(account_table.ownerId, ctx.auth.userId!),
        ),
      });

      return account;
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    const accounts = await ctx.db.query.account_table.findMany({
      where: eq(account_table.ownerId, ctx.auth.userId!),
      orderBy: (accounts, { desc }) => [desc(accounts.name)],
    });

    return accounts;
  }),
});
