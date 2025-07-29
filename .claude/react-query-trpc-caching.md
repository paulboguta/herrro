# React Query + tRPC Caching Strategy

## Overview
This document outlines the caching and performance optimization strategy for the HERRRO finance app using tRPC and React Query.

## Architecture

### Client-Side Caching (React Query)
- **Singleton QueryClient**: Persists across route navigations
- **Stale Time**: 5 minutes for most queries (accounts/transactions change infrequently)
- **GC Time**: 30 minutes (keeps data in cache longer)
- **Refetch Behavior**: Disabled for performance (`refetchOnMount: false`, `refetchOnWindowFocus: false`)

### Server-Side Caching (HTTP Headers)
```typescript
// In /api/trpc/[trpc]/route.ts
responseMeta(opts) {
  if (type === 'query' && errors.length === 0) {
    if (path?.includes('account.getAll') || path?.includes('transaction.getInfinite')) {
      return {
        headers: {
          'cache-control': 's-maxage=300, stale-while-revalidate=1800', // 5min cache, 30min stale
        },
      };
    }
  }
}
```

## Streaming & SSR Patterns

### useSuspenseQuery Pattern
```typescript
// Client component with streaming
const [data] = api.transaction.getInfinite.useSuspenseInfiniteQuery(
  { limit, accountId },
  {
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  }
);
```

### Server-Side Prefetching
```typescript
// Server component
export default async function Page() {
  // Prefetch for streaming
  void api.transaction.getInfinite.prefetch({ limit: 50 });
  
  return (
    <HydrateClient>
      <Suspense fallback={<Skeleton />}>
        <TransactionsList />
      </Suspense>
    </HydrateClient>
  );
}
```

## Avoiding Request Waterfalls

### Parallel Prefetching
```typescript
// Bad: Sequential waterfalls
await api.account.getAll.prefetch();
await api.transaction.getInfinite.prefetch({ limit: 50 });

// Good: Parallel fetching
await Promise.all([
  api.account.getAll.prefetch(),
  api.transaction.getInfinite.prefetch({ limit: 50 }),
]);
```

### Independent Queries
- Account queries and transaction queries are independent
- Both use `useSuspenseQuery` to enable parallel fetching
- No parent-child query dependencies

## Cache Invalidation Strategy

### Smart Invalidation
```typescript
// In mutations - only invalidate what's needed
onSuccess: async () => {
  await Promise.all([
    utils.account.getAll.invalidate(),
    utils.account.getById.invalidate({ id: variables.accountId }),
    utils.transaction.getInfinite.invalidate(),
  ]);
}
```

### Background Refetch (Disabled)
- Disabled automatic background refetching for performance
- Rely on user actions and mutations to trigger updates

## Performance Optimizations

### 1. HTTP-Level Caching
- 5-minute server cache with 30-minute stale-while-revalidate
- Reduces database load and improves response times

### 2. Client-Side Cache Persistence
- Long-lived cache (30min GC time)
- Survives route navigation
- Prevents unnecessary API calls

### 3. Streaming with Suspense
- Page shell renders immediately
- Data streams in when ready
- Better perceived performance

### 4. Prefetching Strategy
- Server-side prefetching for instant data on client hydration
- Parallel data fetching prevents waterfalls

## Debugging

### React Query DevTools
```typescript
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// In TRPCReactProvider
<ReactQueryDevtools initialIsOpen={false} />
```

### Key Metrics to Monitor
- Cache hit ratio in DevTools
- Network requests in browser DevTools
- Time to first byte (TTFB) for API calls
- Cumulative Layout Shift (CLS) from data loading

## Best Practices

### Do's
- ✅ Use `useSuspenseQuery` for streaming
- ✅ Prefetch data in server components
- ✅ Set appropriate `staleTime` based on data volatility
- ✅ Use parallel Promise.all() for independent queries
- ✅ Implement proper error boundaries

### Don'ts
- ❌ Don't enable `refetchOnWindowFocus` for frequently changing routes
- ❌ Don't create query dependencies unnecessarily
- ❌ Don't invalidate entire cache when only specific data changed
- ❌ Don't fetch data in child components if parent already has it

## Current Implementation Status

### Completed
- [x] HTTP-level caching with `responseMeta`
- [x] Singleton QueryClient with proper persistence
- [x] `useSuspenseQuery` for streaming
- [x] Server-side prefetching with HydrateClient
- [x] React Query DevTools integration
- [x] Smart cache invalidation in mutations

### Future Enhancements
- [ ] Implement optimistic updates for better UX
- [ ] Add error boundaries for graceful error handling
- [ ] Consider implementing background sync for offline support
- [ ] Monitor and optimize bundle size impact

## Key Files
- `/src/trpc/react.tsx` - Client setup and QueryClient config
- `/src/trpc/query-client.ts` - Global query defaults
- `/src/app/api/trpc/[trpc]/route.ts` - HTTP caching headers
- `/src/app/(authenticated)/transactions/page.tsx` - Server prefetching example
- `/src/components/transactions/transactions-list.tsx` - Suspense query example