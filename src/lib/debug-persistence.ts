/**
 * Debug utilities for React Query persistence
 * These can be used in the browser console for debugging
 */

import { clearPersistedCache } from "./query-persistence";

// Check what's in the persisted cache
export const inspectPersistedCache = () => {
  if (typeof window === "undefined") {
    console.log("This function only works in the browser");
    return;
  }

  const cacheKey = "herrro-query-cache-v1";
  const cachedData = window.localStorage.getItem(cacheKey);

  if (!cachedData) {
    console.log("No persisted cache found");
    return;
  }

  try {
    const parsed = JSON.parse(cachedData);
    console.log("Persisted cache contents:", parsed);
    
    // Show summary
    const queries = parsed.clientState?.queries || [];
    console.log(`Total persisted queries: ${queries.length}`);
    
    // Show each query's info
    queries.forEach((query: any, index: number) => {
      const [routeParts] = query.queryKey || [];
      const [namespace, method] = Array.isArray(routeParts) ? routeParts : ["unknown", "unknown"];
      const dataUpdatedAt = query.state?.dataUpdatedAt;
      const age = dataUpdatedAt ? Date.now() - dataUpdatedAt : null;
      
      console.log(`Query ${index + 1}:`, {
        namespace,
        method,
        queryKey: query.queryKey,
        status: query.state?.status,
        dataUpdatedAt: dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleString() : "N/A",
        age: age ? `${Math.round(age / 1000)}s` : "N/A",
        hasData: !!query.state?.data,
      });
    });
  } catch (error) {
    console.error("Failed to parse persisted cache:", error);
  }
};

// Clear the persisted cache
export const clearCache = () => {
  clearPersistedCache();
  console.log("Persisted cache cleared");
};

// Get size of persisted cache
export const getCacheSize = () => {
  if (typeof window === "undefined") {
    console.log("This function only works in the browser");
    return;
  }

  const cacheKey = "herrro-query-cache-v1";
  const cachedData = window.localStorage.getItem(cacheKey);

  if (!cachedData) {
    console.log("No persisted cache found");
    return;
  }

  const sizeInBytes = new Blob([cachedData]).size;
  const sizeInKB = (sizeInBytes / 1024).toFixed(2);
  
  console.log(`Cache size: ${sizeInBytes} bytes (${sizeInKB} KB)`);
  return sizeInBytes;
};

// Export to window for easy console access in development
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  (window as any).debugPersistence = {
    inspect: inspectPersistedCache,
    clear: clearCache,
    size: getCacheSize,
  };
  
  console.log("React Query persistence debug tools available:");
  console.log("- debugPersistence.inspect() - View cached queries");
  console.log("- debugPersistence.clear() - Clear persisted cache");
  console.log("- debugPersistence.size() - Get cache size");
}