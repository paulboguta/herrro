import type { QueryClient } from "@tanstack/react-query";
import { accountKeys, transactionKeys } from "./cache-keys";

// Smart cache invalidation strategies
export const cacheInvalidation = {
	// Account invalidation strategies
	account: {
		// Invalidate all account queries
		invalidateAll: (queryClient: QueryClient) => {
			return queryClient.invalidateQueries({
				queryKey: accountKeys.all,
				refetchType: "active", // Only refetch if component is mounted
			});
		},

		// Invalidate specific account
		invalidateOne: (queryClient: QueryClient, accountId: string) => {
			return Promise.all([
				queryClient.invalidateQueries({
					queryKey: accountKeys.detail(accountId),
					refetchType: "active",
				}),
				// Also invalidate the list as the balance might have changed
				queryClient.invalidateQueries({
					queryKey: accountKeys.lists(),
					refetchType: "active",
				}),
			]);
		},

		// Update account in cache without refetching
		updateOne: (
			queryClient: QueryClient,
			accountId: string,
			updater: (old: any) => any,
		) => {
			queryClient.setQueryData(accountKeys.detail(accountId), updater);
			// Also update in the list
			queryClient.setQueriesData(
				{ queryKey: accountKeys.lists() },
				(old: any) => {
					if (!old || !Array.isArray(old)) return old;
					return old.map((account: any) =>
						account.id === accountId ? updater(account) : account,
					);
				},
			);
		},
	},

	// Transaction invalidation strategies
	transaction: {
		// Invalidate all transaction queries
		invalidateAll: (queryClient: QueryClient) => {
			return queryClient.invalidateQueries({
				queryKey: transactionKeys.all,
				refetchType: "active",
			});
		},

		// Invalidate transactions for specific account
		invalidateByAccount: (queryClient: QueryClient, accountId: string) => {
			return Promise.all([
				queryClient.invalidateQueries({
					queryKey: transactionKeys.byAccount(accountId),
					refetchType: "active",
				}),
				queryClient.invalidateQueries({
					queryKey: transactionKeys.infinite(accountId),
					refetchType: "active",
				}),
				// Also invalidate the account to update balance
				cacheInvalidation.account.invalidateOne(queryClient, accountId),
			]);
		},

		// Optimistically add transaction to cache
		addOptimistic: (
			queryClient: QueryClient,
			accountId: string,
			newTransaction: any,
		) => {
			// Add to account-specific list
			queryClient.setQueriesData(
				{ queryKey: transactionKeys.byAccount(accountId) },
				(old: any) => {
					if (!old || !Array.isArray(old)) return [newTransaction];
					return [newTransaction, ...old];
				},
			);

			// Add to general list
			queryClient.setQueriesData(
				{ queryKey: transactionKeys.lists() },
				(old: any) => {
					if (!old || !Array.isArray(old)) return [newTransaction];
					return [newTransaction, ...old];
				},
			);
		},

		// Remove transaction optimistically
		removeOptimistic: (queryClient: QueryClient, transactionId: string) => {
			// Remove from all lists
			queryClient.setQueriesData(
				{ queryKey: transactionKeys.all },
				(old: any) => {
					if (!old || !Array.isArray(old)) return old;
					return old.filter((t: any) => t.id !== transactionId);
				},
			);
		},
	},
};

// Prefetch helpers
export const prefetchHelpers = {
	// Prefetch account details
	prefetchAccount: async (
		queryClient: QueryClient,
		accountId: string,
		fetcher: () => Promise<any>,
	) => {
		return queryClient.prefetchQuery({
			queryKey: accountKeys.detail(accountId),
			queryFn: fetcher,
			staleTime: 5 * 60 * 1000, // 5 minutes
		});
	},

	// Prefetch transactions for an account
	prefetchTransactions: async (
		queryClient: QueryClient,
		accountId: string,
		fetcher: () => Promise<any>,
	) => {
		return queryClient.prefetchQuery({
			queryKey: transactionKeys.byAccount(accountId),
			queryFn: fetcher,
			staleTime: 2 * 60 * 1000, // 2 minutes
		});
	},
};

// Background refetch configuration
export const configureBackgroundRefetch = (queryClient: QueryClient) => {
	// Set up background refetch for critical data
	if (typeof window !== "undefined") {
		// Refetch accounts every 5 minutes if window is focused
		setInterval(
			() => {
				if (document.hasFocus()) {
					queryClient.invalidateQueries({
						queryKey: accountKeys.all,
						refetchType: "active",
					});
				}
			},
			5 * 60 * 1000,
		);
	}
};
