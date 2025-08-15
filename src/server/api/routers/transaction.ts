import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { category_table, transaction_table } from "@/server/db/schema";
import { startOfMonth } from "date-fns";
import { and, count, desc, eq, gte, isNull, lte } from "drizzle-orm";
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
        categoryId: z.string().uuid(),
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
        categoryId: input.categoryId,
        description: input.description ?? null,
      });
      return { success: true };
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    const result = await ctx.db.query.transaction_table.findMany({
      where: eq(transaction_table.ownerId, ctx.auth.userId!),
      orderBy: (transactions, { desc }) => [desc(transactions.date)],
    });

    return result;
  }),

  getAllWithFilters: protectedProcedure
    .input(
      z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
    }),
    )
    .query(async ({ ctx, input }) => {
      const defaultStartDate = startOfMonth(new Date()).toISOString();
      const defaultEndDate = new Date().toISOString();
      
      const whereConditions = [
        eq(transaction_table.ownerId, ctx.auth.userId!),
        gte(transaction_table.date, new Date(input.startDate ?? defaultStartDate)),
        lte(transaction_table.date, new Date(input.endDate ?? defaultEndDate)),
      ];

      const result = await ctx.db
        .select({
          id: transaction_table.id,
          ownerId: transaction_table.ownerId,
          date: transaction_table.date,
          type: transaction_table.type,
          amount: transaction_table.amount,
          currency: transaction_table.currency,
          categoryId: transaction_table.categoryId,
          description: transaction_table.description,
          account: transaction_table.account,
          createdAt: transaction_table.createdAt,
          updatedAt: transaction_table.updatedAt,
          categoryName: category_table.name,
        })
        .from(transaction_table)
        .leftJoin(category_table, eq(transaction_table.categoryId, category_table.id))
        .where(and(...whereConditions))
        .orderBy(desc(transaction_table.date));

      return result;
    }),

  // For now this is always used with filters (period)
  getUncategorizedCount: protectedProcedure.input(z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  })).query(async ({ ctx, input }) => {
    const defaultStartDate = startOfMonth(new Date()).toISOString();
    const defaultEndDate = new Date().toISOString();

    const result = await ctx.db.select({ count: count() }).from(transaction_table).where(and(
      eq(transaction_table.ownerId, ctx.auth.userId!),
      isNull(transaction_table.categoryId),
      gte(transaction_table.date, new Date(input.startDate ?? defaultStartDate)),
      lte(transaction_table.date, new Date(input.endDate ?? defaultEndDate)),
    ));
    return result[0]?.count ?? 0;
  }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        account: z.string().uuid().optional(),
        date: z.string().min(1).optional(),
        type: z.enum(["income", "expense", "transfer"]).optional(),
        amount: z.string().min(1).optional(),
        currency: z.string().min(1).optional(),
        categoryId: z.string().uuid().optional(),
        description: z.string().optional().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;
      const dataToUpdate: Record<string, unknown> = {};
      
      if (updateData.account !== undefined) dataToUpdate.account = updateData.account;
      if (updateData.date !== undefined) dataToUpdate.date = new Date(updateData.date);
      if (updateData.type !== undefined) dataToUpdate.type = updateData.type;
      if (updateData.amount !== undefined) dataToUpdate.amount = updateData.amount;
      if (updateData.currency !== undefined) dataToUpdate.currency = updateData.currency;
      if (updateData.categoryId !== undefined) dataToUpdate.categoryId = updateData.categoryId;
      if (updateData.description !== undefined) dataToUpdate.description = updateData.description;

      await ctx.db
        .update(transaction_table)
        .set(dataToUpdate)
        .where(and(
          eq(transaction_table.id, id),
          eq(transaction_table.ownerId, ctx.auth.userId!)
        ));
      
      return { success: true };
    }),

  updateCategory: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      categoryId: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.update(transaction_table).set({ categoryId: input.categoryId }).where(eq(transaction_table.id, input.id));
    }),

  getByAccountId: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const result = await ctx.db.query.transaction_table.findMany({
        where: and(
          eq(transaction_table.account, input),
          eq(transaction_table.ownerId, ctx.auth.userId!),
        ),
        orderBy: (transactions, { desc }) => [desc(transactions.date)],
      });

      return result;
    }),
});
