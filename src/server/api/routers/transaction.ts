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
import { updateDailySnapshotOptimistic } from "@/server/api/services/netWorthCalculator";

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
        const result = await ctx.db.transaction(async (tx) => {
          console.log(`\n🏁 STARTING DATABASE TRANSACTION`);
          console.log(`Creating transaction: ${input.type} ${input.amount} for account ${input.accountId}`);
          
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
            console.log(`❌ Account ${input.accountId} not found`);
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Account not found during transaction",
            });
          }

          console.log(`📊 Current account balance: ${currentAccount.balance}, version: ${currentAccount.balanceVersion}`);

          // Calculate new balance and running balance
          const amountChange = input.type === "income" ? input.amount : `-${input.amount}`;
          const newBalance = Number.parseFloat(currentAccount.balance) + Number.parseFloat(amountChange);
          const runningBalance = newBalance.toFixed(4);

          console.log(`💰 Balance change: ${amountChange}, new balance: ${runningBalance}`);

          // Create the transaction with running balance
          console.log(`📝 Inserting transaction record...`);
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

          console.log(`✅ Transaction record created with ID: ${transaction.id}`);

          // Update account balance with optimistic locking
          console.log(`🔄 Updating account balance with optimistic lock...`);
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
            console.log(`❌ Optimistic lock failed - account was modified by another transaction`);
            throw new TRPCError({
              code: "CONFLICT",
              message: "Account was modified by another transaction",
            });
          }

          console.log(`✅ Account balance updated successfully to ${updateResult[0].balance}`);

          // Calculate and update daily snapshot optimistically
          try {
            console.log(`\n🔄 TRIGGERING OPTIMISTIC SNAPSHOT UPDATE after transaction creation`);
            console.log(`Transaction: ${input.type} ${input.amount} on ${input.date}`);
            console.log(`User: ${ctx.user.id}, Account: ${input.accountId}`);
            console.log(`New account balance: ${runningBalance}`);
            
            // Calculate total net worth with the new account balance
            const allUserAccounts = await tx
              .select()
              .from(accounts)
              .where(eq(accounts.userId, ctx.user.id));
            
            let totalNetWorth = 0;
            
            for (const acc of allUserAccounts) {
              let accountBalance = 0;
              
              if (acc.id === input.accountId) {
                // Use the new running balance for the affected account
                accountBalance = Number(runningBalance);
                console.log(`Using new balance ${accountBalance} for affected account ${acc.name}`);
              } else {
                // Use current balance for other accounts
                accountBalance = Number(acc.balance);
                console.log(`Using current balance ${accountBalance} for account ${acc.name}`);
              }
              
              // Add to net worth (assets positive, liabilities negative)
              if (acc.category === 'asset') {
                totalNetWorth += accountBalance;
              } else {
                totalNetWorth -= accountBalance;
              }
            }
            
            console.log(`Calculated total net worth: ${totalNetWorth}`);
            
            await updateDailySnapshotOptimistic(ctx.user.id, new Date(input.date), totalNetWorth);
            console.log(`✅ OPTIMISTIC SNAPSHOT UPDATE COMPLETED`);
          } catch (error) {
            console.error('❌ Failed to update daily snapshot optimistically:', error);
            // Don't fail the transaction creation if snapshot update fails
          }

          const result = {
            transaction,
            updatedBalance: updateResult[0].balance,
            balanceVersion: updateResult[0].balanceVersion,
          };
          
          console.log(`🎉 DATABASE TRANSACTION ABOUT TO COMMIT`);
          console.log(`Final result: Transaction ID ${transaction.id}, Balance: ${updateResult[0].balance}`);
          
          return result;
        });
        
        console.log(`🏆 DATABASE TRANSACTION SUCCESSFULLY COMMITTED!`);
        console.log(`Transaction ID ${result.transaction.id} is now permanently saved`);
        
        return result;
      } catch (error) {
        console.log(`❌ DATABASE TRANSACTION FAILED:`, error);
        
        if ((error as TRPCError).code === "CONFLICT" && retryCount < maxRetries - 1) {
          retryCount++;
          console.log(`🔄 Retrying transaction (attempt ${retryCount + 1}/${maxRetries})`);
          // Small delay before retry to reduce contention
          await new Promise((resolve) => setTimeout(resolve, Math.random() * 100));
          continue;
        }
        
        console.log(`💀 TRANSACTION COMPLETELY FAILED after ${retryCount + 1} attempts`);
        throw error;
      }
    }

    console.log(`💀 ALL RETRY ATTEMPTS EXHAUSTED`);
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

          // Calculate and update daily snapshot optimistically after deletion
          try {
            console.log(`\n🗑️ TRIGGERING OPTIMISTIC SNAPSHOT UPDATE after transaction deletion`);
            console.log(`Deleted transaction: ${transaction.type} ${transaction.amount} on ${transaction.date}`);
            console.log(`User: ${ctx.user.id}, Account: ${transaction.accountId}`);
            console.log(`New account balance after deletion: ${balanceStr}`);
            
            // Calculate total net worth with the updated account balance
            const allUserAccounts = await tx
              .select()
              .from(accounts)
              .where(eq(accounts.userId, ctx.user.id));
            
            let totalNetWorth = 0;
            
            for (const acc of allUserAccounts) {
              let accountBalance = 0;
              
              if (acc.id === transaction.accountId) {
                // Use the new balance for the affected account
                accountBalance = Number(balanceStr);
                console.log(`Using new balance ${accountBalance} for affected account ${acc.name}`);
              } else {
                // Use current balance for other accounts
                accountBalance = Number(acc.balance);
                console.log(`Using current balance ${accountBalance} for account ${acc.name}`);
              }
              
              // Add to net worth (assets positive, liabilities negative)
              if (acc.category === 'asset') {
                totalNetWorth += accountBalance;
              } else {
                totalNetWorth -= accountBalance;
              }
            }
            
            console.log(`Calculated total net worth after deletion: ${totalNetWorth}`);
            
            await updateDailySnapshotOptimistic(ctx.user.id, new Date(transaction.date), totalNetWorth);
            console.log(`✅ OPTIMISTIC SNAPSHOT UPDATE COMPLETED`);
          } catch (error) {
            console.error('❌ Failed to update daily snapshot optimistically:', error);
            // Don't fail the transaction deletion if snapshot update fails
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
