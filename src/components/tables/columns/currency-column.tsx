import type { CurrencyOptions } from "@/components/tables/base/types";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

export function createCurrencyColumn<TData>(
  accessorKey: keyof TData,
  options: CurrencyOptions = {}
): ColumnDef<TData> {
  const { currency = "USD", showSymbol = false, precision = 2, size = 160 } = options;

  return {
    accessorKey: accessorKey as string,
    size,
    header: ({ column }) => (
      <div 
        className="flex items-center gap-2 cursor-pointer hover:text-foreground transition-colors"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Amount
        <ArrowUpDown className="h-4 w-4" />
      </div>
    ),
    cell: ({ getValue }) => {
      const amount = getValue() as number;
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        minimumFractionDigits: precision,
        maximumFractionDigits: precision,
      }).format(amount);

      return (
        <div className={`text-left font-normal ${
          amount < 0 
            ? "text-red-600 dark:text-red-400" 
            : amount > 0 
              ? "text-green-600 dark:text-green-400" 
              : "text-foreground"
        }`}>
          {formatted} {showSymbol && currency}
        </div>
      );
    },
  };
}