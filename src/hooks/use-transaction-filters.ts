'use client'

import { startOfMonth } from 'date-fns'
import { parseAsJson, parseAsStringEnum, useQueryStates } from 'nuqs'


export type TransactionCategory = 'all' | 'uncategorized' | 'categorized'

export type URLDateRange = { from?: string, to?: string }

export type TransactionFilters = {
  category: TransactionCategory
  dateRange: URLDateRange
  account: string
  categoryName: string
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

// Utility functions for category name conversion
export const categoryNameToKebab = (name: string): string => {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
};

export const kebabToCategoryName = (kebab: string): string => {
  return kebab.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

export function useTransactionFilters() {
  return useQueryStates({
    category: parseAsStringEnum<TransactionCategory>(['all', 'uncategorized', 'categorized']).withDefault('all'),
    dateRange: parseAsDateRange,
    account: parseAsStringEnum<string>(['all']).withDefault('all'),
    categoryName: parseAsStringEnum<string>(['all']).withDefault('all'),
  })
}