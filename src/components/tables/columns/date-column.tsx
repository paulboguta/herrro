import type { DateOptions } from "@/components/tables/base/types";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

export function createDateColumn<TData>(
  accessorKey: keyof TData,
  options: DateOptions = {}
): ColumnDef<TData> {
  const { format = "short", relative = false, size = 130 } = options;

  return {
    accessorKey: accessorKey as string,
    size,
    header: ({ column }) => (
      <div 
        className="flex items-center gap-2 cursor-pointer hover:text-foreground transition-colors"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Date
        <ArrowUpDown className="h-4 w-4" />
      </div>
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
        <div className="font-normal text-foreground">
          {date.toLocaleDateString("en-US", {
            dateStyle: format as "short" | "medium" | "long",
          })}
        </div>
      );
    },
  };
}