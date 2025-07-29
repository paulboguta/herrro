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
				<div
					key={i}
					className="flex items-center justify-between rounded-lg border p-4"
				>
					<div className="space-y-1">
						<div className="h-4 w-32 animate-pulse rounded bg-muted" />
						<div className="h-3 w-24 animate-pulse rounded bg-muted" />
					</div>
					<div className="h-6 w-16 animate-pulse rounded bg-muted" />
				</div>
			))}
		</div>
	);
}

export function TransactionsList({
	accountId,
	limit = 50,
}: TransactionsListProps) {
	const [data, { fetchNextPage, hasNextPage, isFetchingNextPage }] =
		api.transaction.getInfinite.useSuspenseInfiniteQuery(
			{ limit, accountId },
			{
				getNextPageParam: (lastPage) => lastPage.nextCursor,
				staleTime: 5 * 60 * 1000, // 5 minutes
				refetchOnWindowFocus: false,
				refetchOnMount: false,
			},
		);

	// Flatten the paginated data
	const transactions = useMemo(() => {
		return data.pages.flatMap((page) => page.items);
	}, [data]);

	if (transactions.length === 0) {
		return (
			<Card>
				<CardContent className="flex h-64 items-center justify-center">
					<div className="text-center">
						<h3 className="mb-2 font-semibold text-lg">No transactions yet</h3>
						<p className="text-muted-foreground">
							{accountId
								? "No transactions found for this account"
								: "Start by adding your first transaction"}
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
					<Card
						key={transaction.id}
						className="transition-colors hover:bg-muted/50"
					>
						<CardContent className="flex items-center justify-between p-4">
							<div className="flex items-center space-x-4">
								<div
									className={`rounded-full p-2 ${
										transaction.type === "income"
											? "bg-green-100 text-green-600"
											: "bg-red-100 text-red-600"
									}`}
								>
									{transaction.type === "income" ? (
										<ArrowUpRight className="h-4 w-4" />
									) : (
										<ArrowDownLeft className="h-4 w-4" />
									)}
								</div>
								<div>
									<p className="font-medium">{transaction.description}</p>
									<div className="flex items-center space-x-2 text-muted-foreground text-sm">
										<span>
											{new Date(transaction.date).toLocaleDateString()}
										</span>
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
								<p
									className={`font-semibold ${
										transaction.type === "income"
											? "text-green-600"
											: "text-red-600"
									}`}
								>
									{transaction.type === "income" ? "+" : "-"}
									{formatCurrency(
										transaction.amount,
										transaction.currency || "USD",
									)}
								</p>
								<Badge
									variant={
										transaction.type === "income" ? "default" : "secondary"
									}
								>
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
