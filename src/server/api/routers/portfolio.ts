import { getDailyNetWorthData, getPeriodDateRange, updateDailySnapshot } from "@/server/api/services/netWorthCalculator";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { accounts, dailySnapshots, transactions } from "@/server/db/schema";
import { and, eq, lte } from "drizzle-orm";
import { z } from "zod";

const PERIOD_ENUM = z.enum([
  "1D", "WTD", "7D", "MTD", "30D", "90D", "YTD", "365D", "5Y", "MAX"
]);

export const portfolioRouter = createTRPCRouter({
  /**
   * Get daily chart data for the portfolio over a specified period
   * Always returns daily data points regardless of period selected
   */
  getDailyChartData: protectedProcedure
    .input(z.object({
      period: PERIOD_ENUM.default("YTD"),
    }))
    .query(async ({ input, ctx }) => {
      const userId = ctx.user.id;
      
      try {
        const { startDate, endDate } = getPeriodDateRange(input.period);
        
        const dailyData = await getDailyNetWorthData(userId, startDate, endDate);
        
        // Format data for the chart component
        const chartData = dailyData.map((item) => ({
          period: new Date(item.date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          }),
          date: item.date, // Keep the original date for client-side filtering
          total: item.netWorth,
        }));

        // Calculate period performance
        const startValue = chartData[0]?.total || 0;
        const endValue = chartData[chartData.length - 1]?.total || 0;
        const periodChange = endValue - startValue;
        const periodChangePercent = startValue !== 0 ? (periodChange / startValue) * 100 : 0;

        return {
          data: chartData,
          summary: {
            currentValue: endValue,
            periodChange,
            periodChangePercent,
            isPositive: periodChange >= 0,
          },
        };
      } catch (error) {
        console.error('Error fetching daily chart data:', error);
        throw new Error('Failed to fetch portfolio data');
      }
    }),

  /**
   * Get current net worth for a user
   */
  getCurrentNetWorth: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.user.id;
      
      try {
        const today = new Date();
        const { endDate } = getPeriodDateRange("1D");
        
        const dailyData = await getDailyNetWorthData(userId, today, endDate);
        const currentNetWorth = dailyData[dailyData.length - 1]?.netWorth || 0;
        
        return {
          netWorth: currentNetWorth,
          asOf: today.toISOString(),
        };
      } catch (error) {
        console.error('Error fetching current net worth:', error);
        throw new Error('Failed to fetch current net worth');
      }
    }),

  /**
   * Debug endpoint to manually recalculate snapshots for specific dates
   */
  recalculateSnapshots: protectedProcedure
    .input(z.object({
      dates: z.array(z.string()), // Array of date strings in YYYY-MM-DD format
    }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id;
      
      const results = []; 
      
      for (const dateStr of input.dates) {
        try {
          const date = new Date(`${dateStr}T12:00:00.000Z`); // Noon UTC to avoid timezone issues
          
          // Debug: Check what accounts exist for this user
          const userAccounts = await db
            .select()
            .from(accounts)
            .where(eq(accounts.userId, userId));
          
          // Debug: Check what transactions exist for this date
          const endOfDay = new Date(date);
          endOfDay.setHours(23, 59, 59, 999);
          
          const transactionsOnDate = await db
            .select()
            .from(transactions)
            .where(
              and(
                eq(transactions.userId, userId),
                lte(transactions.date, endOfDay)
              )
            );
          
          await updateDailySnapshot(userId, date);
          
          // Get the updated snapshot to verify
          const snapshot = await db
            .select()
            .from(dailySnapshots)
            .where(
              and(
                eq(dailySnapshots.userId, userId),
                eq(dailySnapshots.date, dateStr)
              )
            )
            .limit(1);
            
          results.push({
            date: dateStr,
            netWorth: snapshot[0]?.netWorth || "0",
            debug: {
              accountsCount: userAccounts.length,
              transactionsCount: transactionsOnDate.length,
              accounts: userAccounts.map(acc => ({
                id: acc.id,
                name: acc.name,
                category: acc.category,
                startingBalance: acc.startingBalance
              })),
              transactions: transactionsOnDate.map(tx => ({
                id: tx.id,
                accountId: tx.accountId,
                amount: tx.amount,
                type: tx.type,
                date: tx.date,
                runningBalance: tx.runningBalance
              }))
            },
            success: true,
          });
        } catch (error) {
          results.push({
            date: dateStr,
            error: (error as Error).message,
            success: false,
          });
        }
      }
      
      return results;
    }),
});