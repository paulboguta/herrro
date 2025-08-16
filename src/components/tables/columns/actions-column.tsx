import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontalIcon } from "lucide-react";
import { type ReactNode } from "react";

export interface ActionItem<TData> {
  key: string;
  render: (data: TData) => ReactNode;
}

interface ActionsColumnOptions<TData> {
  actions: ActionItem<TData>[];
  size?: number;
}

export function createActionsColumn<TData>(
  options: ActionsColumnOptions<TData>
): ColumnDef<TData> {
  const { actions, size = 30 } = options;

  return {
    id: "actions",
    size,
    cell: ({ row }) => {
      const data = row.original;
      
      return (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {actions.map((action) => (
              <div key={action.key}>
                {action.render(data)}
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  };
}