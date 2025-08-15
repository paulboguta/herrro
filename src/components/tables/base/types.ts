import type { ColumnDef } from "@tanstack/react-table";

export interface TableConfig<TData> {
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enableSelection?: boolean;
  pageSize?: number;
}

export interface FinancialTableProps<TData> extends TableConfig<TData> {
  currencyCode?: string;
  dateFormat?: string;
  showAmountSummary?: boolean;
  enableExport?: boolean;
}

export interface BaseColumnOptions {
  size?: number;
}

export interface CurrencyOptions extends BaseColumnOptions {
  currency?: string;
  showSymbol?: boolean;
  precision?: number;
}

export interface DateOptions extends BaseColumnOptions {
  format?: string;
  relative?: boolean;
}

export interface CategoryOptions extends BaseColumnOptions {
  showBadge?: boolean;
  colorMapping?: Record<string, string>;
}

export interface ActionsOptions<TData> extends BaseColumnOptions {
  onEdit?: (row: TData) => void;
  onDelete?: (row: TData) => void;
  onDuplicate?: (row: TData) => void;
  customActions?: Array<{
    label: string;
    onClick: (row: TData) => void;
  }>;
}