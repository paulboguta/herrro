import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { account_table, category_table, transaction_table } from "@/server/db/schema";
import { startOfMonth } from "date-fns";
import { and, eq, gte, isNull, lte } from "drizzle-orm";
import { z } from "zod";

export const filtersRouter = createTRPCRouter({
  getTransactionFilters: protectedProcedure
    .input(
      z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const defaultStartDate = startOfMonth(new Date()).toISOString();
      const defaultEndDate = new Date().toISOString();

      // TODO: Merge into one db query
      const accounts = await ctx.db.query.account_table.findMany({
        where: eq(account_table.ownerId, ctx.auth.userId!),
        orderBy: (accounts, { desc }) => [desc(accounts.name)],
      });

      const categories = await ctx.db.query.category_table.findMany({
        where: eq(category_table.ownerId, ctx.auth.userId!),
        orderBy: (categories, { asc }) => [asc(categories.name)],
      });

      const uncategorizedCount = await ctx.db
        .select()
        .from(transaction_table)
        .where(
          and(
            eq(transaction_table.ownerId, ctx.auth.userId!),
            gte(
              transaction_table.date,
              new Date(input.startDate ?? defaultStartDate),
            ),
            lte(
              transaction_table.date,
              new Date(input.endDate ?? defaultEndDate),
            ),
            isNull(transaction_table.categoryId),
          ),
        );

      return {
        accounts,
        categories,
        uncategorizedCount: uncategorizedCount.length,
      };
    }),
});
