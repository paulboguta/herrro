import { QueryClient, defaultShouldDehydrateQuery } from "@tanstack/react-query";
import SuperJSON from "superjson";
import { shouldPersistQuery } from "@/lib/query-persistence";

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        // Longer stale time to reduce unnecessary refetches
        // Accounts data changes infrequently, so we can cache longer
        staleTime: 5 * 60 * 1000, // 5 minutes

        // Keep data in cache for 30 minutes even if component unmounts
        // This prevents refetching when navigating between pages
        gcTime: 30 * 60 * 1000, // 30 minutes

        // Retry failed queries with exponential backoff
        retry: (failureCount, error) => {
          if (failureCount >= 3) return false;
          // Don't retry on 4xx errors (client errors)
          if (error instanceof Error && error.message.includes("4")) return false;
          return true;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

        // Only refetch if data is stale
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
      },
      mutations: {
        // Retry mutations once on network errors
        retry: 1,
        retryDelay: 1000,
      },
      dehydrate: {
        serializeData: SuperJSON.serialize,
        shouldDehydrateQuery: (query) => {
          // Default dehydration logic
          const defaultDehydrate = defaultShouldDehydrateQuery(query) || query.state.status === "pending";
          
          // Also check if this query should be persisted
          if (query.state.status === "success" && shouldPersistQuery(query.queryKey as unknown[])) {
            return true;
          }
          
          return defaultDehydrate;
        },
      },
      hydrate: {
        deserializeData: SuperJSON.deserialize,
      },
    },
  });
