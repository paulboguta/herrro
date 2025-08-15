"use client";
import { TransactionsTable } from "@/components/tables/entities/transactions-table";
import { categoryNameToKebab, useTransactionFilters } from "@/hooks/use-transaction-filters";
import { api } from "@/trpc/react";

export default function TransactionsContents() {
  const [filters] = useTransactionFilters();

  const [transactions] = api.transaction.getAllWithFilters.useSuspenseQuery({
    startDate: filters.dateRange.from,
    endDate: filters.dateRange.to,
  });

  if (!transactions) {
    return <div>Loading 2...</div>;
  }

  // Client-side filtering (later we should move most to the server side filtering)
  const filteredTransactions = transactions?.filter((transaction) => {
    const accountMatch =
      filters.account === "all" || transaction.account === filters.account;

    const categoryMatch = (() => {
      switch (filters.category) {
        case "uncategorized":
          return transaction.categoryId === null;
        case "categorized":
          return transaction.categoryId !== null;
        case "all":
        default:
          return true;
      }
    })();

    // Filter by specific category name
    const categoryNameMatch =
      filters.categoryName === "all" ||
      (transaction.categoryName && categoryNameToKebab(transaction.categoryName) === filters.categoryName);

    // Filter by transaction type
    const typeMatch =
      filters.type === "all" || transaction.type === filters.type;

    return accountMatch && categoryMatch && categoryNameMatch && typeMatch;
  });

  return <TransactionsTable transactions={filteredTransactions} />;
}
