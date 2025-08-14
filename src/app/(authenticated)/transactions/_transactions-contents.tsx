"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { categoryNameToKebab, useTransactionFilters } from "@/hooks/use-transaction-filters";
import { api } from "@/trpc/react";
import Image from "next/image";

export default function TransactionsContents() {
  const [filters] = useTransactionFilters();

  const [transactions] = api.transaction.getAllWithFilters.useSuspenseQuery({
    startDate: filters.dateRange.from,
    endDate: filters.dateRange.to,
  });

  if (!transactions) {
    return <div>Loading 2...</div>;
  }

  // Client-side filtering
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

    return accountMatch && categoryMatch && categoryNameMatch;
  });

  return (
    <div>
      <Table className="max-w-3xl">
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Merchant</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTransactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>{transaction.date.toLocaleDateString()}</TableCell>
              <TableCell>
                <Image
                  className="rounded-full"
                  src={transaction.merchantLogoUrl ?? ""}
                  alt={transaction.merchantName ?? ""}
                  width={24}
                  height={24}
                />
              </TableCell>
              <TableCell>{transaction.categoryName}</TableCell>
              <TableCell>
                {transaction.amount} {transaction.currency}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
