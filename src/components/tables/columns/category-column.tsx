import type { CategoryOptions } from "@/components/tables/base/types";
import { Badge } from "@/components/ui/badge";
import type { ColumnDef } from "@tanstack/react-table";

export function createCategoryColumn<TData>(
  accessorKey: keyof TData,
  options: CategoryOptions = {},
): ColumnDef<TData> {
  const {
    showBadge = false,
    // TODO: add color mapping
    //  colorMapping = {}
  } = options;

  return {
    accessorKey: accessorKey as string,
    header: "Category",
    cell: ({ getValue }) => {
      const category = getValue() as string | null;

      if (!category) {
        return (
          <Badge variant="outline" className="text-muted-foreground">
            Uncategorized
          </Badge>
        );
      }

      if (showBadge) {
        // TODO: add color mapping
        // const color = colorMapping[category] ?? "default";
        return (
          <Badge variant="outline" className="font-medium">
            {category}
          </Badge>
        );
      }

      return <span className="font-medium">{category}</span>;
    },
  };
}
