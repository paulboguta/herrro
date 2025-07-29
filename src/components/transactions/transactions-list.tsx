"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/trpc/react";
import { formatCurrency } from "@/lib/utils";
import { Loader2, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { transactionKeys } from "@/lib/cache-keys";

interface TransactionsListProps {
	accountId?: string;
	limit?: number;
}

function TransactionSkeleton() {
	return (
		<div className="space-y-3">
			{Array.from({ length: 5 }).map((_, i) => (
				<div key={i} className="flex items-center justify-between p-4 border rounded-lg">
					<div className="space-y-1">
						<div className="h-4 bg-muted animate-pulse rounded w-32" />
						<div className="h-3 bg-muted animate-pulse rounded w-24" />
					</div>
					<div className="h-6 bg-muted animate-pulse rounded w-16" />
				</div>
			))}
		</div>
	);
}

export function TransactionsList({ accountId, limit = 50 }: TransactionsListProps) {
	// Use infinite query for better pagination performance
	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading,
		error,
	} = api.transaction.getInfinite.useInfiniteQuery(
		{
			limit,
			accountId,
		},
		{
			getNextPageParam: (lastPage) => {
				return lastPage.nextCursor;
			},
			// Optimize caching for transaction data
			staleTime: 2 * 60 * 1000, // 2 minutes
			cacheTime: 10 * 60 * 1000, // 10 minutes
			// Keep previous data while fetching new data
			keepPreviousData: true,
			// Refetch when window gains focus if data is stale
			refetchOnWindowFocus: "always",
			// Enable background refetch
			refetchOnMount: false,
		}
	);

	// Flatten the paginated data
	const transactions = useMemo(() => {
		return data?.pages.flatMap(page => page.items) ?? [];
	}, [data]);

	if (error) {
		return (
			<Card>
				<CardContent className="flex items-center justify-center h-64">
					<div className="text-center">
						<h3 className="font-semibold text-lg text-destructive mb-2">
							Error loading transactions
						</h3>
						<p className="text-muted-foreground">{error.message}</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	if (isLoading) {
		return <TransactionSkeleton />;
	}

	if (transactions.length === 0) {
		return (
			<Card>
				<CardContent className="flex items-center justify-center h-64">
					<div className="text-center">
						<h3 className="font-semibold text-lg mb-2">No transactions yet</h3>
						<p className="text-muted-foreground">
							{accountId 
								? "No transactions found for this account" 
								: "Start by adding your first transaction"
							}
						</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-4">
			<div className="space-y-3">
				{transactions.map((transaction) => (
					<Card key={transaction.id} className="transition-colors hover:bg-muted/50">
						<CardContent className="flex items-center justify-between p-4">
							<div className="flex items-center space-x-4">
								<div className={`p-2 rounded-full ${
									transaction.type === "income" 
										? "bg-green-100 text-green-600" 
										: "bg-red-100 text-red-600"
								}`}>
									{transaction.type === "income" ? (
										<ArrowUpRight className="h-4 w-4" />
									) : (
										<ArrowDownLeft className="h-4 w-4" />
									)}
								</div>
								<div>
									<p className="font-medium">{transaction.description}</p>
									<div className="flex items-center space-x-2 text-sm text-muted-foreground">
										<span>{new Date(transaction.date).toLocaleDateString()}</span>
										{transaction.account && (
											<>
												<span>•</span>
												<span>{transaction.account.name}</span>
											</>
										)}
									</div>
								</div>
							</div>
							<div className="text-right">
								<p className={`font-semibold ${
									transaction.type === "income" 
										? "text-green-600" 
										: "text-red-600"
								}`}>
									{transaction.type === "income" ? "+" : "-"}
									{formatCurrency(
										transaction.amount, 
										transaction.currency || "USD"
									)}
								</p>
								<Badge variant={transaction.type === "income" ? "default" : "secondary"}>
									{transaction.type}
								</Badge>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Load More Button */}
			{hasNextPage && (
				<div className="flex justify-center pt-4">
					<Button
						variant="outline"
						onClick={() => fetchNextPage()}
						disabled={isFetchingNextPage}
					>
						{isFetchingNextPage ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Loading more...
							</>
						) : (
							"Load more transactions"
						)}
					</Button>
				</div>
			)}
		</div>
	);
}

// Hook for prefetching transaction data
export function usePrefetchTransactions() {
	const utils = api.useUtils();

	const prefetchTransactions = (accountId?: string) => {
		void utils.transaction.getInfinite.prefetchInfinite({
			limit: 50,
			accountId,
		});
	};

	return { prefetchTransactions };
}