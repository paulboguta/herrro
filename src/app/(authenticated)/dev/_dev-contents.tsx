"use client";

import DateRangePicker from "@/components/filters/date-range-picker";
import { FilterButton } from "@/components/filters/filter-button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDateRangeForDisplay } from "@/lib/dates";
import { subDays } from "date-fns";
import { Calendar } from "lucide-react";
import { useState } from "react";
import type { DateRange } from "react-day-picker";

export const DevContents = () => {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 6),
    to: new Date(),
  });

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <Tabs defaultValue="uncategorized" defaultChecked>
          <TabsList>
            <TabsTrigger value="uncategorized">Uncategorized</TabsTrigger>
            <TabsTrigger value="categorized">Categorized</TabsTrigger>
          </TabsList>
          <TabsContent value="uncategorized">
            <div>Uncategorized</div>
          </TabsContent>
          <TabsContent value="categorized">
            <div>Categorized</div>
          </TabsContent>
        </Tabs>

        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <FilterButton 
                label="Date" 
                icon={Calendar} 
                active={!!dateRange}
                value={formatDateRangeForDisplay(dateRange)}
              />
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <DateRangePicker 
                value={dateRange}
                onChange={setDateRange}
              />
            </PopoverContent>
          </Popover>
          <FilterButton label="Amount"  />
          <FilterButton label="Category" />
        </div>
      </div>
    </div>
  ); 
};
