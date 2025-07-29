import { db } from "@/server/db";
import { accounts, dailySnapshots, transactions } from "@/server/db/schema";
import { eq, and, sql, gte, lte, desc, asc } from "drizzle-orm";

/**
 * Calculate net worth for a specific user on a specific date
 * Sums all account balances as of that date based on transactions
 */
export async function calculateNetWorthForDate(userId: string, date: Date): Promise<number> {
  try {
    console.log(`\n=== CALCULATING NET WORTH FOR ${date.toISOString().split('T')[0]} ===`);
    
    // Get all accounts for the user
    const userAccounts = await db
      .select()
      .from(accounts)
      .where(eq(accounts.userId, userId));

    console.log(`Found ${userAccounts.length} accounts for user ${userId}`);
    
    if (userAccounts.length === 0) {
      console.log('No accounts found, returning 0');
      return 0;
    }

    let totalNetWorth = 0;

    // Convert date to end of day for proper comparison
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    console.log(`Calculating for date range: ${date.toISOString()} to ${endOfDay.toISOString()}`);

    // Calculate balance for each account as of the specified date
    for (const account of userAccounts) {
      console.log(`\n--- Processing account: ${account.name} (${account.category}) ---`);
      console.log(`Starting balance: ${account.startingBalance}`);
      
      // Get ALL transactions for this account on or before the end of the specified date
      const allTransactions = await db
        .select()
        .from(transactions)
        .where(
          and(
            eq(transactions.accountId, account.id),
            lte(transactions.date, endOfDay)
          )
        )
        .orderBy(desc(transactions.date));

      console.log(`ALL TRANSACTIONS for account ${account.name}:`);
      allTransactions.forEach((tx, i) => {
        console.log(`  ${i + 1}. ${tx.type} ${tx.amount} on ${tx.date?.toISOString()} (running: ${tx.runningBalance})`);
      });

      // Get the last transaction for this account on or before the end of the specified date
      const lastTransaction = allTransactions.slice(0, 1);

      console.log(`Found ${lastTransaction.length} transactions for account ${account.name} up to ${endOfDay.toISOString()}`);
      
      let accountBalance = 0;
      
      if (lastTransaction.length > 0) {
        const tx = lastTransaction[0];
        console.log(`Last transaction: ${tx.type} ${tx.amount} on ${tx.date?.toISOString()}, running balance: ${tx.runningBalance}`);
        // Use the running balance from the last transaction
        accountBalance = Number(tx.runningBalance);
      } else {
        console.log('No transactions found, using starting balance');
        // No transactions yet, use starting balance
        accountBalance = Number(account.startingBalance);
      }

      console.log(`Account balance: ${accountBalance}`);

      // Add to net worth (assets positive, liabilities negative)
      if (account.category === 'asset') {
        console.log(`Adding ${accountBalance} (asset) to net worth`);
        totalNetWorth += accountBalance;
      } else {
        console.log(`Subtracting ${accountBalance} (liability) from net worth`);
        totalNetWorth -= accountBalance; // Liabilities subtract from net worth
      }
    }

    console.log(`TOTAL NET WORTH: ${totalNetWorth}`);
    console.log(`=== END CALCULATION ===\n`);
    
    return totalNetWorth;
  } catch (error) {
    console.error('Error calculating net worth for date:', error);
    throw new Error('Failed to calculate net worth');
  }
}

/**
 * Update or create a daily snapshot for a specific date
 * This is called whenever a financial event affects a particular date
 */
export async function updateDailySnapshot(userId: string, date: Date): Promise<void> {
  try {
    console.log(`\n>>> UPDATING DAILY SNAPSHOT for ${userId} on ${date.toISOString().split('T')[0]} <<<`);
    
    const netWorth = await calculateNetWorthForDate(userId, date);
    const dateStr = date.toISOString().split('T')[0];
    
    console.log(`Calculated net worth: ${netWorth}, dateStr: ${dateStr}`);
    
    await upsertDailySnapshot(userId, dateStr, netWorth);
    
    console.log(`>>> SNAPSHOT UPDATE COMPLETE <<<\n`);
  } catch (error) {
    console.error('Error updating daily snapshot:', error);
    throw new Error('Failed to update daily snapshot');
  }
}

/**
 * Update daily snapshot with a known net worth value (optimistic update)
 * Use this when you already know the net worth and don't need to recalculate
 */
export async function updateDailySnapshotOptimistic(
  userId: string, 
  date: Date, 
  knownNetWorth: number
): Promise<void> {
  try {
    const dateStr = date.toISOString().split('T')[0];
    console.log(`\n>>> OPTIMISTIC SNAPSHOT UPDATE for ${userId} on ${dateStr} with net worth: ${knownNetWorth} <<<`);
    
    await upsertDailySnapshot(userId, dateStr, knownNetWorth);
    
    console.log(`>>> OPTIMISTIC SNAPSHOT UPDATE COMPLETE <<<\n`);
  } catch (error) {
    console.error('Error updating daily snapshot optimistically:', error);
    throw new Error('Failed to update daily snapshot optimistically');
  }
}

/**
 * Internal helper to upsert daily snapshot
 */
async function upsertDailySnapshot(userId: string, dateStr: string, netWorth: number): Promise<void> {
  // Check if snapshot already exists for this user/date
  const existingSnapshot = await db
    .select()
    .from(dailySnapshots)
    .where(
      and(
        eq(dailySnapshots.userId, userId),
        eq(dailySnapshots.date, dateStr)
      )
    )
    .limit(1);

  if (existingSnapshot.length > 0) {
    console.log(`Updating existing snapshot from ${existingSnapshot[0].netWorth} to ${netWorth}`);
    // Update existing snapshot
    await db
      .update(dailySnapshots)
      .set({
        netWorth: netWorth.toString(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(dailySnapshots.userId, userId),
          eq(dailySnapshots.date, dateStr)
        )
      );
  } else {
    console.log(`Creating new snapshot with net worth: ${netWorth}`);
    // Insert new snapshot
    await db
      .insert(dailySnapshots)
      .values({
        userId,
        date: dateStr,
        netWorth: netWorth.toString(),
      });
  }
}

/**
 * Get daily net worth data with gap filling for a date range
 * Uses SQL window functions to carry forward previous values for missing days
 */
export async function getDailyNetWorthData(
  userId: string, 
  startDate: Date, 
  endDate: Date
): Promise<Array<{ date: string; netWorth: number }>> {
  try {
    // First, get existing snapshots within the requested range
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    const existingSnapshots = await db
      .select()
      .from(dailySnapshots)
      .where(
        and(
          eq(dailySnapshots.userId, userId),
          gte(dailySnapshots.date, startDateStr),
          lte(dailySnapshots.date, endDateStr)
        )
      )
      .orderBy(asc(dailySnapshots.date));

    // Get the initial net worth value for the start date
    // First, try to find the most recent snapshot before the start date
    let initialNetWorth = 0;
    
    const priorSnapshot = await db
      .select()
      .from(dailySnapshots)
      .where(
        and(
          eq(dailySnapshots.userId, userId),
          lte(dailySnapshots.date, startDateStr)
        )
      )
      .orderBy(desc(dailySnapshots.date))
      .limit(1);

    if (priorSnapshot.length > 0 && priorSnapshot[0]) {
      // Use the most recent snapshot as the initial value
      initialNetWorth = Number(priorSnapshot[0].netWorth);
      console.log(`Found prior snapshot for ${startDateStr}: ${initialNetWorth}`);
    } else {
      // No prior snapshot exists, calculate net worth as of start date
      console.log(`No prior snapshot found, calculating net worth for ${startDateStr}`);
      initialNetWorth = await calculateNetWorthForDate(userId, startDate);
    }

    // If no snapshots exist in the range, return data with the initial value carried forward
    if (existingSnapshots.length === 0) {
      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const emptyData = [];
      
      for (let i = 0; i <= daysDiff; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        const dateStr = currentDate.toISOString().split('T')[0];
        emptyData.push({
          date: dateStr,
          netWorth: initialNetWorth,
        });
      }
      
      return emptyData;
    }

    // Use gap-filling approach with the correct initial value
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const result = [];
    let lastKnownValue = initialNetWorth; // Start with the correct initial value
    
    const snapshotMap = new Map(
      existingSnapshots.map(snap => [snap.date, Number(snap.netWorth)])
    );

    for (let i = 0; i <= daysDiff; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      const dateStr = currentDate.toISOString().split('T')[0];
      
      if (snapshotMap.has(dateStr)) {
        lastKnownValue = snapshotMap.get(dateStr)!;
      }
      
      result.push({
        date: dateStr,
        netWorth: lastKnownValue,
      });
    }

    return result;
  } catch (error) {
    console.error('Error getting daily net worth data:', error);
    throw new Error('Failed to get daily net worth data');
  }
}

/**
 * Helper function to convert period strings to date ranges
 */
export function getPeriodDateRange(period: string): { startDate: Date; endDate: Date } {
  const now = new Date();
  const endDate = new Date(now);
  let startDate = new Date(now);

  switch (period) {
    case '1D':
      startDate.setDate(now.getDate() - 1);
      break;
    case 'WTD':
      // Start of current week (Monday)
      const dayOfWeek = now.getDay();
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      startDate.setDate(now.getDate() - daysToMonday);
      break;
    case '7D':
      startDate.setDate(now.getDate() - 7);
      break;
    case 'MTD':
      // Start of current month
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case '30D':
      startDate.setDate(now.getDate() - 30);
      break;
    case '90D':
      startDate.setDate(now.getDate() - 90);
      break;
    case 'YTD':
      // Start of current year
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    case '365D':
      startDate.setDate(now.getDate() - 365);
      break;
    case '5Y':
      startDate.setFullYear(now.getFullYear() - 5);
      break;
    case 'MAX':
      // Get the earliest transaction date or 5 years ago, whichever is more recent
      startDate.setFullYear(now.getFullYear() - 5);
      break;
    default:
      // Default to 7 days
      startDate.setDate(now.getDate() - 7);
  }

  // Ensure we don't go before 1970 for date compatibility
  if (startDate.getFullYear() < 1970) {
    startDate = new Date(1970, 0, 1);
  }

  return { startDate, endDate };
}