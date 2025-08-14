"use client"

import {
  startOfMonth,
  startOfYear,
  subDays,
  subMonths,
  subYears
} from "date-fns"
import { useState } from "react"
import { type DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"

type DateOption = {
  label: string;
  value: Date | DateRange;
}

const getDefaultOptions = (): DateOption[] => {
  const today = new Date();
  
  return [
    {
      label: "Today",
      value: { from: today, to: today }
    },
    {
      label: "Last week",
      value: { from: subDays(today, 6), to: today }
    },
    {
      label: "Last month",
      value: { from: subMonths(today, 1), to: today }
    },
    {
      label: "Month to date",
      value: { from: startOfMonth(today), to: today }
    },
    {
      label: "Last year",
      value: { from: subYears(today, 1), to: today }
    },
    {
      label: "Year to date",
      value: { from: startOfYear(today), to: today }
    }
  ];
};

type DateRangePickerProps = {
  defaultDateRange?: DateRange;
  onChange?: (dateRange: DateRange) => void;
  value?: DateRange;
}

export default function DateRangePicker({
  defaultDateRange,
  onChange,
  value,
}: DateRangePickerProps) {
  const today = new Date();
  const options = getDefaultOptions();
  const [month, setMonth] = useState(today);
  
  // Use controlled value or fallback to defaultDateRange or default option
  const currentDateRange = value ?? defaultDateRange ?? (options[1]?.value as DateRange);

  const handleOptionClick = (option: DateOption) => {
    const range = option.value as DateRange;
    onChange?.(range);
    if (range.to) {
      setMonth(range.to);
    }
  };

  const handleCalendarSelect = (newDate: DateRange | undefined) => {
    if (newDate) {
      onChange?.(newDate);
    }
  };

  return (
    <div>
      <div className="rounded-md border">
        <div className="flex max-sm:flex-col">
          <div className="relative py-4 max-sm:order-1 max-sm:border-t sm:w-32">
            <div className="h-full sm:border-e">
              <div className="flex flex-col px-2">
                {options.map((option, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => handleOptionClick(option)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <Calendar
            mode="range"
            selected={currentDateRange}
            onSelect={handleCalendarSelect}
            month={month}
            onMonthChange={setMonth}
            className="p-2"
            disabled={[
              { after: today }, // Dates before today, later we might have to toggle this option
            ]}
          />
        </div>
      </div>
    </div>
  )
}