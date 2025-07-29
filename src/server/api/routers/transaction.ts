import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { transactions, accounts } from "@/server/db/schema";
import {
  createTransactionSchema,
  updateTransactionSchema,
  getTransactionSchema,
  getTransactionsByAccountSchema,
  getAllTransactionsSchema,
} from "@/server/api/schemas/transaction";
import { eq, and, desc, sql, gte, lte } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const transactionRouter = createTRPCRouter({
  create: protectedProcedure.input(createTransactionSchema).mutation(async ({ ctx, input }) => {
    // Verify the account belongs to the user
    const account = await ctx.db.query.accounts.findFirst({
      where: and(eq(accounts.id, input.accountId), eq(accounts.userId, ctx.user.id)),
    });

    if (!account) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Account not found or unauthorized",
      });
    }

    // Use a database transaction for consistency with retry logic for optimistic locking
    const maxRetries = 3;
    let retryCount = 0;

    while (retryCount < maxRetries) {
      try {
        return await ctx.db.transaction(async (tx) => {
          // Get current account with version for optimistic locking
          const currentAccount = await tx.query.accounts.findFirst({
            where: eq(accounts.id, input.accountId),
            columns: {
              id: true,
              balance: true,
              balanceVersion: true,
            },
          });

          if (!currentAccount) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Account not found during transaction",
            });
          }

          // Calculate new balance and running balance
          const amountChange = input.type === "income" ? input.amount : `-${input.amount}`;

          const newBalance = Number.parseFloat(currentAccount.balance) + Number.parseFloat(amountChange);
          const runningBalance = newBalance.toFixed(4);

          // Create the transaction with running balance
          const [transaction] = await tx
            .insert(transactions)
            .values({
              userId: ctx.user.id,
              accountId: input.accountId,
              amount: input.amount,
              type: input.type,
              status: input.status,
              category: input.category,
              currency: input.currency,
              description: input.description,
              date: input.date,
              runningBalance: runningBalance,
            })
            .returning();

          // Update account balance with optimistic locking
          const updateResult = await tx
            .update(accounts)
            .set({
              balance: runningBalance,
              balanceVersion: currentAccount.balanceVersion + 1,
              updatedAt: new Date(),
            })
            .where(and(eq(accounts.id, input.accountId), eq(accounts.balanceVersion, currentAccount.balanceVersion)))
            .returning();

          // Check if the optimistic lock succeeded
          if (updateResult.length === 0) {
            throw new TRPCError({
              code: "CONFLICT",
              message: "Account was modified by another transaction",
            });
          }

          return {
            transaction,
            updatedBalance: updateResult[0].balance,
            balanceVersion: updateResult[0].balanceVersion,
          };
        });
      } catch (error) {
        if ((error as TRPCError).code === "CONFLICT" && retryCount < maxRetries - 1) {
          retryCount++;
          // Small delay before retry to reduce contention
          await new Promise((resolve) => setTimeout(resolve, Math.random() * 100));
          continue;
        }
        throw error;
      }
    }

    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to create transaction after multiple retries",
    });
  }),

  getAll: protectedProcedure.input(getAllTransactionsSchema).query(async ({ ctx, input }) => {
    // Add cache headers for Edge caching
    ctx.resHeaders?.set("Cache-Control", "private, max-age=30, stale-while-revalidate=60");

    const result = await ctx.db.query.transactions.findMany({
      where: eq(transactions.userId, ctx.user.id),
      orderBy: [desc(transactions.date), desc(transactions.createdAt)],
      limit: input.limit || 50,
      offset: input.offset || 0,
      with: {
        account: {
          columns: {
            id: true,
            name: true,
            currency: true,
          },
        },
      },
    });

    // Return count for pagination
    const totalCount = await ctx.db
      .select({ count: sql<number>`count(*)` })
      .from(transactions)
      .where(eq(transactions.userId, ctx.user.id))
      .then((res) => res[0]?.count ?? 0);

    return {
      items: result,
      totalCount,
      hasMore: (input.offset || 0) + result.length < totalCount,
    };
  }),

  getByAccount: protectedProcedure.input(getTransactionsByAccountSchema).query(async ({ ctx, input }) => {
    // Add cache headers for Edge caching
    ctx.resHeaders?.set("Cache-Control", "private, max-age=30, stale-while-revalidate=60");

    // Verify the account belongs to the user
    const account = await ctx.db.query.accounts.findFirst({
      where: and(eq(accounts.id, input.accountId), eq(accounts.userId, ctx.user.id)),
    });

    if (!account) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Account not found or unauthorized",
      });
    }

    const result = await ctx.db.query.transactions.findMany({
      where: and(eq(transactions.userId, ctx.user.id), eq(transactions.accountId, input.accountId)),
      orderBy: [desc(transactions.date), desc(transactions.createdAt)],
      limit: input.limit || 50,
      offset: input.offset || 0,
    });

    // Return count for pagination
    const totalCount = await ctx.db
      .select({ count: sql<number>`count(*)` })
      .from(transactions)
      .where(and(eq(transactions.userId, ctx.user.id), eq(transactions.accountId, input.accountId)))
      .then((res) => res[0]?.count ?? 0);

    return {
      items: result,
      totalCount,
      hasMore: (input.offset || 0) + result.length < totalCount,
    };
  }),

  delete: protectedProcedure.input(getTransactionSchema).mutation(async ({ ctx, input }) => {
    // Get the transaction to verify ownership and get amount for balance update
    const transaction = await ctx.db.query.transactions.findFirst({
      where: and(eq(transactions.id, input.id), eq(transactions.userId, ctx.user.id)),
    });

    if (!transaction) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Transaction not found or unauthorized",
      });
    }

    // Use optimistic locking for deletion as well
    const maxRetries = 3;
    let retryCount = 0;

    while (retryCount < maxRetries) {
      try {
        return await ctx.db.transaction(async (tx) => {
          // Get current account with version for optimistic locking
          const currentAccount = await tx.query.accounts.findFirst({
            where: eq(accounts.id, transaction.accountId),
            columns: {
              id: true,
              balance: true,
              balanceVersion: true,
            },
          });

          if (!currentAccount) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Account not found during deletion",
            });
          }

          // Delete the transaction first
          await tx.delete(transactions).where(eq(transactions.id, input.id));

          // Calculate balance change (reverse the transaction)
          const amountChange = transaction.type === "income" ? `-${transaction.amount}` : transaction.amount;

          const newBalance = Number.parseFloat(currentAccount.balance) + Number.parseFloat(amountChange);
          const balanceStr = newBalance.toFixed(4);

          // Update account balance with optimistic locking
          const updateResult = await tx
            .update(accounts)
            .set({
              balance: balanceStr,
              balanceVersion: currentAccount.balanceVersion + 1,
              updatedAt: new Date(),
            })
            .where(
              and(eq(accounts.id, transaction.accountId), eq(accounts.balanceVersion, currentAccount.balanceVersion)),
            )
            .returning();

          // Check if the optimistic lock succeeded
          if (updateResult.length === 0) {
            throw new TRPCError({
              code: "CONFLICT",
              message: "Account was modified by another transaction",
            });
          }

          return {
            success: true,
            updatedBalance: updateResult[0].balance,
            balanceVersion: updateResult[0].balanceVersion,
          };
        });
      } catch (error) {
        if ((error as TRPCError).code === "CONFLICT" && retryCount < maxRetries - 1) {
          retryCount++;
          // Small delay before retry to reduce contention
          await new Promise((resolve) => setTimeout(resolve, Math.random() * 100));
          continue;
        }
        throw error;
      }
    }

    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to delete transaction after multiple retries",
    });
  }),

  // Get transactions for a date range (useful for reports)
  getByDateRange: protectedProcedure
    .input(
      z.object({
        startDate: z.string().datetime(),
        endDate: z.string().datetime(),
        accountId: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Add cache headers for Edge caching
      ctx.resHeaders?.set("Cache-Control", "private, max-age=300, stale-while-revalidate=600");

      const conditions = [
        eq(transactions.userId, ctx.user.id),
        gte(transactions.date, input.startDate),
        lte(transactions.date, input.endDate),
      ];

      if (input.accountId) {
        conditions.push(eq(transactions.accountId, input.accountId));
      }

      return await ctx.db.query.transactions.findMany({
        where: and(...conditions),
        orderBy: [desc(transactions.date), desc(transactions.createdAt)],
        with: {
          account: {
            columns: {
              id: true,
              name: true,
              currency: true,
            },
          },
        },
      });
    }),

  // Infinite query for better pagination performance
  getInfinite: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        cursor: z.number().optional(), // Offset-based cursor
        accountId: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Add cache headers for Edge caching
      ctx.resHeaders?.set("Cache-Control", "private, max-age=30, stale-while-revalidate=60");

      const conditions = [eq(transactions.userId, ctx.user.id)];

      if (input.accountId) {
        conditions.push(eq(transactions.accountId, input.accountId));
      }

      const items = await ctx.db.query.transactions.findMany({
        where: and(...conditions),
        orderBy: [desc(transactions.date), desc(transactions.createdAt)],
        limit: input.limit + 1, // Fetch one extra to check if there's more
        offset: input.cursor || 0,
        with: {
          account: {
            columns: {
              id: true,
              name: true,
              currency: true,
            },
          },
        },
      });

      let nextCursor: number | undefined = undefined;
      if (items.length > input.limit) {
        // Remove the extra item
        items.pop();
        nextCursor = (input.cursor || 0) + input.limit;
      }

      return {
        items,
        nextCursor,
        hasMore: nextCursor !== undefined,
      };
    }),
});
