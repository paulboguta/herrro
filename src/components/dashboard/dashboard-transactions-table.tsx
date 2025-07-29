"use client";

import { Suspense } from "react";
import { api } from "@/trpc/react";
import { TransactionsTable } from "@/components/ui/transactions-table";

function DashboardTransactionsContent() {
  const [data] = api.transaction.getInfinite.useSuspenseInfiniteQuery(
    { limit: 20 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  );

  // Transform tRPC data to match the existing table schema
  const transactions = data.pages
    .flatMap((page) => page.items)
    .map((transaction) => ({
      id: parseInt(transaction.id.replace(/-/g, "").slice(0, 8), 16), // Convert UUID to number
      date: transaction.date,
      description: transaction.description,
      category: transaction.type === "income" ? "Income" : "Expense", // Map to existing categories
      amount: transaction.type === "income" ? transaction.amount : -transaction.amount,
      account: transaction.account?.name || "Unknown Account",
      status: "Cleared", // Default status
    }));

  return <TransactionsTable data={transactions} />;
}

function DashboardTransactionsSkeleton() {
  // Use empty data to show the table structure
  return <TransactionsTable data={[]} />;
}

export function DashboardTransactionsTable() {
  return (
    <Suspense fallback={<DashboardTransactionsSkeleton />}>
      <DashboardTransactionsContent />
    </Suspense>
  );
}
