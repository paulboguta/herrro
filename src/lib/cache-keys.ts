// Cache key factories for consistent query key management
// This helps with cache invalidation and prevents key collisions

export const accountKeys = {
	all: ["account"] as const,
	lists: () => [...accountKeys.all, "list"] as const,
	list: (filters?: Record<string, unknown>) => 
		filters 
			? [...accountKeys.lists(), filters] as const 
			: accountKeys.lists(),
	details: () => [...accountKeys.all, "detail"] as const,
	detail: (id: string) => [...accountKeys.details(), id] as const,
} as const;

export const transactionKeys = {
	all: ["transaction"] as const,
	lists: () => [...transactionKeys.all, "list"] as const,
	list: (filters?: { accountId?: string; limit?: number; offset?: number }) => 
		filters 
			? [...transactionKeys.lists(), filters] as const 
			: transactionKeys.lists(),
	byAccount: (accountId: string) => 
		[...transactionKeys.all, "byAccount", accountId] as const,
	details: () => [...transactionKeys.all, "detail"] as const,
	detail: (id: string) => [...transactionKeys.details(), id] as const,
	infinite: (accountId?: string) => 
		accountId 
			? [...transactionKeys.all, "infinite", accountId] as const
			: [...transactionKeys.all, "infinite"] as const,
} as const;

// Helper to get all query keys for a resource
export const getAllQueryKeys = (resource: "account" | "transaction") => {
	switch (resource) {
		case "account":
			return accountKeys.all;
		case "transaction":
			return transactionKeys.all;
		default:
			return [];
	}
};