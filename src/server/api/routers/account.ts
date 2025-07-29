import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { accounts } from "@/server/db/schema";
import { createAccountSchema, updateAccountSchema, getAccountSchema } from "@/server/api/schemas/account";
import { eq, and, inArray } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const accountRouter = createTRPCRouter({
  create: protectedProcedure.input(createAccountSchema).mutation(async ({ ctx, input }) => {
    const [newAccount] = await ctx.db
      .insert(accounts)
      .values({
        userId: ctx.user.id,
        name: input.name,
        type: input.type,
        category: input.category,
        currency: input.currency,
        balance: input.balance,
        startingBalance: input.startingBalance,
      })
      .returning();

    // Return the created account for optimistic updates
    return newAccount;
  }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    // Add cache headers for Edge caching
    ctx.resHeaders?.set("Cache-Control", "private, max-age=60, stale-while-revalidate=300");

    return await ctx.db.query.accounts.findMany({
      where: eq(accounts.userId, ctx.user.id),
      orderBy: (accounts, { desc }) => [desc(accounts.createdAt)],
    });
  }),

  getById: protectedProcedure.input(getAccountSchema).query(async ({ ctx, input }) => {
    // Add cache headers for Edge caching
    ctx.resHeaders?.set("Cache-Control", "private, max-age=300, stale-while-revalidate=600");

    const account = await ctx.db.query.accounts.findFirst({
      where: and(eq(accounts.id, input.id), eq(accounts.userId, ctx.user.id)),
    });

    if (!account) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Account not found",
      });
    }

    return account;
  }),

  update: protectedProcedure.input(getAccountSchema.merge(updateAccountSchema)).mutation(async ({ ctx, input }) => {
    const { id, ...updateData } = input;

    // Verify ownership
    const existingAccount = await ctx.db.query.accounts.findFirst({
      where: and(eq(accounts.id, id), eq(accounts.userId, ctx.user.id)),
    });

    if (!existingAccount) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Account not found",
      });
    }

    const [updatedAccount] = await ctx.db
      .update(accounts)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(accounts.id, id))
      .returning();

    return updatedAccount;
  }),

  delete: protectedProcedure.input(getAccountSchema).mutation(async ({ ctx, input }) => {
    // Verify ownership
    const existingAccount = await ctx.db.query.accounts.findFirst({
      where: and(eq(accounts.id, input.id), eq(accounts.userId, ctx.user.id)),
    });

    if (!existingAccount) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Account not found",
      });
    }

    await ctx.db.delete(accounts).where(eq(accounts.id, input.id));

    return { success: true };
  }),

  // Batch get for prefetching multiple accounts
  getBatch: protectedProcedure.input(z.object({ ids: z.array(z.string()) })).query(async ({ ctx, input }) => {
    if (input.ids.length === 0) return [];

    // Add cache headers for Edge caching
    ctx.resHeaders?.set("Cache-Control", "private, max-age=300, stale-while-revalidate=600");

    return await ctx.db.query.accounts.findMany({
      where: and(eq(accounts.userId, ctx.user.id), inArray(accounts.id, input.ids)),
    });
  }),
});
