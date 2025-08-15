import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface DataTableSkeletonProps {
  columns: number[];
  rows?: number;
}

export function DataTableSkeleton({
  columns,
  rows = 5,
}: DataTableSkeletonProps) {
  return (
    <div className="w-fit">
      <div className="border border-muted/50 rounded-lg overflow-hidden bg-transparent">
        <Table
          style={{
            width: columns.reduce((acc, col) => acc + col, 0),
          }}
        >
          <TableHeader>
            <TableRow>
              {columns.map((width, index) => (
                <TableHead 
                  key={index}
                  style={{ 
                    width: typeof width === 'string' ? width : `${width}px` 
                  }}
                >
                  <Skeleton className={cn("h-4 w-20 bg-muted/30 px-3", index === columns.length - 1 && "bg-transparent")} />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {columns.map((width, colIndex) => (
                  <TableCell 
                    key={colIndex}
                    style={{ 
                      width: typeof width === 'string' ? width : `${width}px` 
                    }}
                  >
                    <Skeleton className="h-8  bg-transparent px-3" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {/* {showPagination && (
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="text-sm text-muted-foreground">
            <Skeleton className="h-4 w-32 bg-muted" />
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-20 bg-muted" />
            <Skeleton className="h-8 w-16 bg-muted" />
            <Skeleton className="h-8 w-12 bg-muted" />
          </div>
        </div>
      )} */}
    </div>
  );
}