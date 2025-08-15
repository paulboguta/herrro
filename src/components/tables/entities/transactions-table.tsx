"use client";

import { EditTransaction } from "@/app/(authenticated)/transactions/_components/edit-transaction";
import { createActionsColumn } from "@/components/tables/columns/actions-column";
import { createCategoryColumn } from "@/components/tables/columns/category-column";
import { createCurrencyColumn } from "@/components/tables/columns/currency-column";
import { createDateColumn } from "@/components/tables/columns/date-column";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import type { Transaction } from "@/server/db/schema";
import type { ColumnDef } from "@tanstack/react-table";
import { EditIcon } from "lucide-react";
import { useState } from "react";
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
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  
  const processedTransactions: ProcessedTransaction[] = transactions.map(transaction => ({
    ...transaction,
    amount: parseFloat(transaction.amount),
  }));

  const columns: ColumnDef<ProcessedTransaction>[] = [
    createDateColumn("date", { size: 120 }),
    createCurrencyColumn("amount", { size: 140 }),
    createCategoryColumn("categoryName", { size: 150 }),
    {
      accessorKey: "description",
      header: "Description",
      size: 300,
      cell: ({ getValue }) => {
        const description = getValue() as string | null;
        return <div className="font-normal text-foreground truncate">{description ?? "—"}</div>;
      },
    },
    createActionsColumn<ProcessedTransaction>({
      actions: [
        {
          key: "edit",
          render: (transaction) => {
            // Convert ProcessedTransaction back to Transaction format
            const originalTransaction: Transaction = {
              ...transaction,
              amount: transaction.amount.toString(),
            };
            
            return (
              <DropdownMenuItem onSelect={() => setEditingTransaction(originalTransaction)}>
                <EditIcon className="mr-2 h-4 w-4" />
                Edit transaction
              </DropdownMenuItem>
            );
          }
        }
      ],
      size: 60,
    }),
  ];

  return (
    <>
      <DataTable
        data={processedTransactions}
        columns={columns}
        enableSorting={true}
        enableFiltering={true}
        pageSize={20}
      />
      {editingTransaction && (
        <EditTransaction 
          transaction={editingTransaction}
          open={!!editingTransaction}
          onOpenChange={(open) => !open && setEditingTransaction(null)}
        />
      )}
    </>
  );
}