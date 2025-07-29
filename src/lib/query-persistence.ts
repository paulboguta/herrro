import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import type { PersistedClient, Persister } from "@tanstack/react-query-persist-client";
import type { DehydrateOptions } from "@tanstack/react-query";

// Version key for cache invalidation
const CACHE_VERSION = "1";
const CACHE_KEY = `herrro-query-cache-v${CACHE_VERSION}`;

// Create the persister with custom logic for cleaning stale data
export const createPersister = (): Persister | undefined => {
  if (typeof window === "undefined") {
    return undefined;
  }

  try {
    const basePersister = createSyncStoragePersister({
      storage: window.localStorage,
      key: CACHE_KEY,
      // Throttle writes to localStorage to improve performance
      throttleTime: 1000,
    });

    // Wrap the base persister to add our custom logic
    return {
      persistClient: async (client: PersistedClient) => {
        // Clean stale data before persisting
        const cleanedClient = removeStalePersistedData(client);
        if (cleanedClient) {
          await basePersister.persistClient(cleanedClient);
        }
      },
      restoreClient: basePersister.restoreClient,
      removeClient: basePersister.removeClient,
    };
  } catch (error) {
    console.warn("Failed to create persister:", error);
    return undefined;
  }
};

// Helper to clear persisted cache (useful for debugging or when data structure changes)
export const clearPersistedCache = () => {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(CACHE_KEY);
  }
};

// Check if we should persist a query based on its key
export const shouldPersistQuery = (queryKey: unknown[]): boolean => {
  // tRPC queries have a specific structure: [["portfolio", "getDailyChartData"], { input: {...} }]
  if (Array.isArray(queryKey) && queryKey.length >= 1) {
    const [routeParts] = queryKey;
    
    if (Array.isArray(routeParts) && routeParts.length >= 2) {
      const [namespace, method] = routeParts;
      
      // Only persist portfolio chart data queries
      if (namespace === "portfolio" && method === "getDailyChartData") {
        return true;
      }
    }
  }
  
  // Don't persist other queries by default
  return false;
};

// Custom dehydrate options for persisted queries
export const getDehydrateOptions = (): Partial<DehydrateOptions> => ({
  shouldDehydrateQuery: (query) => {
    // Only persist successful queries
    if (query.state.status !== "success") {
      return false;
    }

    // Check if this query should be persisted
    return shouldPersistQuery(query.queryKey as unknown[]);
  },
});

// Helper to remove stale data from persisted client
export const removeStalePersistedData = (persistedClient: PersistedClient | null): PersistedClient | null => {
  if (!persistedClient) return null;

  const now = Date.now();
  const maxAge = 10 * 60 * 1000; // 10 minutes

  // Filter out stale queries
  const queries = persistedClient.clientState.queries.filter(query => {
    const dataUpdatedAt = query.state.dataUpdatedAt;
    if (!dataUpdatedAt) return false;

    const age = now - dataUpdatedAt;
    
    // Only keep persisted queries that are not stale
    if (shouldPersistQuery(query.queryKey)) {
      return age < maxAge;
    }

    // Remove non-persisted queries from cache
    return false;
  });

  return {
    ...persistedClient,
    clientState: {
      ...persistedClient.clientState,
      queries,
    },
  };
};