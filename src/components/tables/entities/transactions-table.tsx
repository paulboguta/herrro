"use client";

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
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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

function TransactionEditForm({ transaction }: { transaction: ProcessedTransaction }) {
  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <label htmlFor="description" className="text-right">Description</label>
        <Input
          id="description"
          defaultValue={transaction.description ?? ""}
          className="col-span-3"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <label htmlFor="amount" className="text-right">Amount</label>
        <Input
          id="amount"
          type="number"
          defaultValue={transaction.amount.toString()}
          className="col-span-3"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <label htmlFor="category" className="text-right">Category</label>
        <Input
          id="category"
          defaultValue={transaction.categoryName ?? ""}
          className="col-span-3"
        />
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline">Cancel</Button>
        <Button>Save Changes</Button>
      </div>
    </div>
  );
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
        return <div className="font-medium">{description ?? "—"}</div>;
      },
    },
    createCategoryColumn("categoryName"),
    createCurrencyColumn("amount"),
    {
      id: "actions",
      cell: ({ row }) => {
        const transaction = row.original;
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <Sheet>
                <SheetTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <EditIcon className="mr-2 h-4 w-4" />
                    Edit transaction
                  </DropdownMenuItem>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Edit Transaction</SheetTitle>
                  </SheetHeader>
                  <TransactionEditForm transaction={transaction} />
                </SheetContent>
              </Sheet>
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