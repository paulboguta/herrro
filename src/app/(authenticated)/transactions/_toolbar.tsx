"use client";

import DateRangePicker from "@/components/filters/date-range-picker";
import { FilterButton } from "@/components/filters/filter-button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTriggerSimple,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toolbar } from "@/components/ui/toolbar";
import { useTransactionFilters } from "@/hooks/use-transaction-filters";
import { formatDateRangeForDisplay } from "@/lib/dates";
import { api } from "@/trpc/react";
import { Calendar, Landmark } from "lucide-react";

export function TransactionToolbar() {
  const [filters, setFilters] = useTransactionFilters();

  const [accounts] = api.account.getAll.useSuspenseQuery();

  const [transactions] = api.transaction.getAllWithFilters.useSuspenseQuery({
    startDate: filters.dateRange.from,
    endDate: filters.dateRange.to,
  });

  const uncategorizedCount = transactions.filter(
    (transaction) =>
      transaction.category === null &&
      (filters.account === "all" || transaction.account === filters.account),
  ).length;

  return (
    <Toolbar>
      <div className="flex flex-col gap-10">
        <Tabs
          value={
            filters.category === "all" ? "uncategorized" : filters.category
          }
          onValueChange={(value) =>
            setFilters({
              ...filters,
              category: value as "uncategorized" | "categorized",
            })
          }
        >
          <TabsList>
            <TabsTrigger value="uncategorized">
              Uncategorized
              <Badge>{uncategorizedCount}</Badge>
            </TabsTrigger>
            <TabsTrigger value="categorized">Categorized</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <FilterButton
                label="Date"
                icon={Calendar}
                active={!!filters.dateRange}
                value={formatDateRangeForDisplay({
                  from: new Date(filters.dateRange.from ?? new Date()),
                  to: new Date(filters.dateRange.to ?? new Date()),
                })}
              />
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <DateRangePicker
                value={filters.dateRange}
                onChange={(dateRange) => setFilters({ ...filters, dateRange })}
              />
            </PopoverContent>
          </Popover>
          <Select
            value={filters.account}
            onValueChange={(account) => setFilters({ ...filters, account })}
          >
            <SelectTriggerSimple asChild>
              <FilterButton
                label="Account"
                icon={Landmark}
                active={filters.account !== "all"}
                value={
                  filters.account === "all"
                    ? "All accounts"
                    : (accounts.find((a) => a.id === filters.account)?.name ??
                      "Unknown")
                }
              />
            </SelectTriggerSimple>
            <SelectContent>
              <SelectItem value="all">All accounts</SelectItem>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </Toolbar>
  );
}
