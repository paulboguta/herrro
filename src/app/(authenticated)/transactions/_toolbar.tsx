"use client";

import DateRangePicker from "@/components/filters/date-range-picker";
import { FilterButton } from "@/components/filters/filter-button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toolbar } from "@/components/ui/toolbar";
import { useTransactionFilters } from "@/hooks/use-transaction-filters";
import { formatDateRangeForDisplay } from "@/lib/dates";
import { api } from "@/trpc/react";
import { Calendar } from "lucide-react";

export function TransactionToolbar() {
  const [filters, setFilters] = useTransactionFilters();
  
  const [transactions] = api.transaction.getAllWithFilters.useSuspenseQuery({
    startDate: filters.dateRange.from,
    endDate: filters.dateRange.to,
  });
  
  const uncategorizedCount = transactions.filter(
    (transaction) => transaction.category === null,
  ).length;

  return (
    <Toolbar>
      {/* Category Tabs */}
      <Tabs 
        value={filters.category === 'all' ? 'uncategorized' : filters.category} 
        onValueChange={(value) => setFilters({ ...filters, category: value as 'uncategorized' | 'categorized' })}
      >
        <TabsList>
          <TabsTrigger value="uncategorized">
            Uncategorized
            <Badge >{uncategorizedCount}</Badge>
          </TabsTrigger>
          <TabsTrigger value="categorized">
            Categorized
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Date Range Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <FilterButton 
            label="Date" 
            icon={Calendar} 
            active={!!filters.dateRange}
            value={formatDateRangeForDisplay({ from: new Date(filters.dateRange.from ?? new Date()), to: new Date(filters.dateRange.to ?? new Date()) })}
          />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <DateRangePicker 
            value={filters.dateRange}
            onChange={(dateRange) => setFilters({ ...filters, dateRange })}
          />
        </PopoverContent>
      </Popover>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Add Transaction Button */}
      {/* <CreateTransaction /> */}
    </Toolbar>
  );
}