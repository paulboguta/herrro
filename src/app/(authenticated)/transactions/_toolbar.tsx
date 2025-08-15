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
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toolbar } from "@/components/ui/toolbar";
import { categoryNameToKebab, kebabToCategoryName, useTransactionFilters } from "@/hooks/use-transaction-filters";
import { formatDateRangeForDisplay } from "@/lib/dates";
import { api } from "@/trpc/react";
import { Calendar } from "lucide-react";

export function TransactionToolbar() {
  const [filters, setFilters] = useTransactionFilters();

  const { data: accounts, isLoading: accountsLoading } = api.account.getAll.useQuery();
  const { data: categories, isLoading: categoriesLoading } = api.category.getAll.useQuery();
  const { data: uncategorizedCount, isLoading: uncategorizedCountLoading } = api.transaction.getUncategorizedCount.useQuery({
    startDate: filters.dateRange.from,
    endDate: filters.dateRange.to,
  });

  const isLoading = accountsLoading || categoriesLoading || uncategorizedCountLoading;

  return (
    <Toolbar>
      <div className="flex flex-col gap-10">
        <Tabs
          value={
            filters.category
          }
          onValueChange={(value) =>
            setFilters({
              ...filters,
              category: value as "uncategorized" | "categorized",
            })
          }
        >
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="categorized">Categorized</TabsTrigger>
            <TabsTrigger value="uncategorized">
              Uncategorized
              {isLoading ? <Skeleton className="size-5 rounded" /> : <Badge>{uncategorizedCount}</Badge>}
            </TabsTrigger>
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
                active={filters.account !== "all"}
                value={
                  filters.account === "all"
                    ? "All accounts"
                    : (accounts?.find((a) => a.id === filters.account)?.name ??
                      "Unknown")
                }
              />
            </SelectTriggerSimple>
            <SelectContent>
              <SelectItem value="all">All accounts</SelectItem>
              {accounts?.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.categoryName}
            onValueChange={(categoryName) => setFilters({ ...filters, categoryName })}
          >
            <SelectTriggerSimple asChild>
              <FilterButton
                label="Category"
                active={filters.categoryName !== "all"}
                value={
                  filters.categoryName === "all"
                    ? "All categories"
                    : kebabToCategoryName(filters.categoryName)
                }
              />
            </SelectTriggerSimple>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories?.map((category) => (
                <SelectItem key={category.id} value={categoryNameToKebab(category.name)}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </Toolbar>
  );
}
