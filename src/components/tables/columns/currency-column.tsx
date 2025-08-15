import type { CurrencyOptions } from "@/components/tables/base/types";
import { Button } from "@/components/ui/button";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

export function createCurrencyColumn<TData>(
  accessorKey: keyof TData,
  options: CurrencyOptions = {}
): ColumnDef<TData> {
  const { currency = "USD", showSymbol = true, precision = 2 } = options;

  return {
    accessorKey: accessorKey as string,
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-auto p-0 font-medium"
      >
        Amount
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
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
        <div className={`text-right font-mono ${amount < 0 ? "text-red-600" : ""}`}>
          {formatted} {showSymbol && currency}
        </div>
      );
    },
  };
}