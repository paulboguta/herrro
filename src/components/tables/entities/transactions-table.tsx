"use client";

import { EditTransaction } from "@/app/(authenticated)/transactions/_components/edit-transaction";
import { createCategoryColumn } from "@/components/tables/columns/category-column";
import { createCurrencyColumn } from "@/components/tables/columns/currency-column";
import { createDateColumn } from "@/components/tables/columns/date-column";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Transaction } from "@/server/db/schema";
import type { ColumnDef } from "@tanstack/react-table";
import { EditIcon, MoreHorizontalIcon } from "lucide-react";
import { DataTable } from "../base/data-table";

type TransactionWithCategoryName = Transaction & {
  categoryName: string | null;
};

type ProcessedTransaction = Omit<TransactionWithCategoryName, 'amount'> & {
  amount: number;
};

interface TransactionsTableProps {
  transactions: TransactionWithCategoryName[];
}


export function TransactionsTable({ transactions }: TransactionsTableProps) {
  const processedTransactions: ProcessedTransaction[] = transactions.map(transaction => ({
    ...transaction,
    amount: parseFloat(transaction.amount),
  }));

  const columns: ColumnDef<ProcessedTransaction>[] = [
    createDateColumn("date"),
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ getValue }) => {
        const description = getValue() as string | null;
        return <div className="font-medium truncate">{description ?? "—"}</div>;
      },
    },
    createCategoryColumn("categoryName"),
    createCurrencyColumn("amount"),
    {
      id: "actions",
      cell: ({ row }) => {
        const transaction = row.original;
        // Convert ProcessedTransaction back to Transaction format
        const originalTransaction: Transaction = {
          ...transaction,
          amount: transaction.amount.toString(),
        };
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <EditTransaction transaction={originalTransaction}>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <EditIcon className="mr-2 h-4 w-4" />
                  Edit transaction
                </DropdownMenuItem>
              </EditTransaction>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <DataTable
      data={processedTransactions}
      columns={columns}
      enableSorting={true}
      enableFiltering={true}
      pageSize={20}
    />
  );
}