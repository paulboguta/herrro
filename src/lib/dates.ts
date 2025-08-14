import { 
  isToday, 
  isYesterday, 
  isSameDay, 
  startOfMonth, 
  startOfYear, 
  subDays, 
  subMonths, 
  subYears,
  format
} from "date-fns";
import type { DateRange } from "react-day-picker";

export function formatDateRangeForDisplay(dateRange?: DateRange): string | undefined {
  if (!dateRange?.from || !dateRange?.to) {
    return undefined;
  }

  const { from, to } = dateRange;
  const today = new Date();

  // Same day ranges
  if (isSameDay(from, to)) {
    if (isToday(from)) return "Today";
    if (isYesterday(from)) return "Yesterday";
    return format(from, "MMM d");
  }

  // Common presets - must match DateRangePicker options exactly
  if (isSameDay(from, subDays(today, 6)) && isSameDay(to, today)) {
    return "Last week";
  }

  if (isSameDay(from, subMonths(today, 1)) && isSameDay(to, today)) {
    return "Last month";
  }

  if (isSameDay(from, startOfMonth(today)) && isSameDay(to, today)) {
    return "Month to date";
  }

  if (isSameDay(from, subYears(today, 1)) && isSameDay(to, today)) {
    return "Last year";
  }

  if (isSameDay(from, startOfYear(today)) && isSameDay(to, today)) {
    return "Year to date";
  }

  // Same month, different days
  if (from.getMonth() === to.getMonth() && from.getFullYear() === to.getFullYear()) {
    return `${format(from, "MMM d")}-${format(to, "d")}`;
  }

  // Same year, different months
  if (from.getFullYear() === to.getFullYear()) {
    return `${format(from, "MMM d")} - ${format(to, "MMM d")}`;
  }

  // Different years
  return `${format(from, "MMM d, yyyy")} - ${format(to, "MMM d, yyyy")}`;
}