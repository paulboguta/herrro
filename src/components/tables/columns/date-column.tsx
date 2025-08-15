import type { DateOptions } from "@/components/tables/base/types";
import { Button } from "@/components/ui/button";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

export function createDateColumn<TData>(
  accessorKey: keyof TData,
  options: DateOptions = {}
): ColumnDef<TData> {
  const { format = "short", relative = false } = options;

  return {
    accessorKey: accessorKey as string,
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-auto p-0 font-medium"
      >
        Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ getValue }) => {
      const date = getValue() as Date;
      
      if (relative) {
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return "Today";
        if (diffDays === 1) return "Yesterday";
        if (diffDays < 7) return `${diffDays} days ago`;
      }

      return (
        <div className="font-medium">
          {date.toLocaleDateString("en-US", {
            dateStyle: format as "short" | "medium" | "long",
          })}
        </div>
      );
    },
  };
}