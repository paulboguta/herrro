'use client'

import { startOfMonth } from 'date-fns'
import { parseAsStringEnum, parseAsIsoDate, useQueryStates } from 'nuqs'
import type { DateRange } from 'react-day-picker'

// Default date range: this month
const getDefaultDateRange = (): DateRange => ({
  from: startOfMonth(new Date()),
  to: new Date(),
})

// Transaction filter types
export type TransactionCategory = 'all' | 'uncategorized' | 'categorized'

export interface TransactionFilters {
  category: TransactionCategory
  dateRange: DateRange
}

export function useTransactionFilters() {
  return useQueryStates({
    category: parseAsStringEnum<TransactionCategory>(['all', 'uncategorized', 'categorized']).withDefault('all'),
    from: parseAsIsoDate.withDefault(getDefaultDateRange().from!),
    to: parseAsIsoDate.withDefault(getDefaultDateRange().to!),
  })
}

// Helper hook that combines from/to into dateRange for easier consumption
export function useTransactionFiltersWithDateRange() {
  const [filters, setFilters] = useTransactionFilters()
  
  return [
    {
      category: filters.category,
      dateRange: { from: filters.from, to: filters.to }
    },
    {
      setCategory: (category: TransactionCategory) => setFilters({ category }),
      setDateRange: (dateRange: DateRange) => setFilters({ 
        from: dateRange.from ?? getDefaultDateRange().from!, 
        to: dateRange.to ?? getDefaultDateRange().to! 
      })
    }
  ] as const
}