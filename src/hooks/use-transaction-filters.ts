'use client'

import { startOfMonth } from 'date-fns'
import { parseAsJson, parseAsStringEnum, useQueryStates } from 'nuqs'


export type TransactionCategory = 'all' | 'uncategorized' | 'categorized'

export type URLDateRange = { from?: string, to?: string }

export type TransactionFilters = {
  category: TransactionCategory
  dateRange: URLDateRange
}

const getDefaultDateRange = (): URLDateRange => ({
  from: startOfMonth(new Date()).toISOString(),
  to: new Date().toISOString(),
})

const parseAsDateRange = parseAsJson<URLDateRange>((value: unknown): URLDateRange => {
  if (typeof value === 'object' && value !== null && 'from' in value && 'to' in value) {
    const obj = value as Record<string, unknown>
    return {
      from: obj.from ? (obj.from as string) : undefined,
      to: obj.to ? (obj.to as string) : undefined,
    }
  }
  return getDefaultDateRange()
}).withDefault(getDefaultDateRange())

export function useTransactionFilters() {
  return useQueryStates({
    category: parseAsStringEnum<TransactionCategory>(['all', 'uncategorized', 'categorized']).withDefault('all'),
    dateRange: parseAsDateRange,
  })
}