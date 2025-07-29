"use client";

import { CreateTransactionForm } from "@/app/_components/transactions/create-transaction-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { api } from "@/trpc/react";
import { ArrowDownLeft, ArrowUpRight, Loader2 } from "lucide-react";
import { useMemo } from "react";

interface AccountTransactionsProps {
  accountId: string;
}

function TransactionSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between rounded-lg border p-4">
          <div className="flex items-center space-x-4">
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
            <div className="space-y-1">
              <div className="h-4 w-32 animate-pulse rounded bg-muted" />
              <div className="h-3 w-24 animate-pulse rounded bg-muted" />
            </div>
          </div>
          <div className="space-y-1 text-right">
            <div className="h-4 w-16 animate-pulse rounded bg-muted" />
            <div className="h-4 w-12 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function AccountTransactions({ accountId }: AccountTransactionsProps) {
  // Use infinite query for better pagination performance
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error } =
    api.transaction.getInfinite.useInfiniteQuery(
      {
        limit: 20,
        accountId,
      },
      {
        getNextPageParam: (lastPage) => {
          return lastPage.nextCursor;
        },
        // Cache for 2 minutes
        staleTime: 2 * 60 * 1000,
        cacheTime: 10 * 60 * 1000,
        keepPreviousData: true,
      },
    );

  // Flatten the paginated data
  const transactions = useMemo(() => {
    return data?.pages.flatMap((page) => page.items) ?? [];
  }, [data]);

  if (error) {
    return (
      <Card>
        <CardContent className="flex h-64 items-center justify-center">
          <div className="text-center">
            <h3 className="mb-2 font-semibold text-destructive text-lg">Error loading transactions</h3>
            <p className="text-muted-foreground">{error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Transactions</CardTitle>
          <CreateTransactionForm defaultAccountId={accountId} />
        </CardHeader>
        <CardContent>
          <TransactionSkeleton />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Transactions ({transactions.length})</CardTitle>
        <CreateTransactionForm defaultAccountId={accountId} />
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <h3 className="mb-2 font-semibold text-lg">No transactions yet</h3>
              <p className="mb-4 text-muted-foreground">Add your first transaction to see it here</p>
              <CreateTransactionForm defaultAccountId={accountId} />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <Card key={transaction.id} className="transition-colors hover:bg-muted/50">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center space-x-4">
                      {/* Transaction type icon */}
                      <div
                        className={`rounded-full p-2 ${
                          transaction.type === "income" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                        }`}
                      >
                        {transaction.type === "income" ? (
                          <ArrowUpRight className="h-4 w-4" />
                        ) : (
                          <ArrowDownLeft className="h-4 w-4" />
                        )}
                      </div>

                      {/* Transaction details */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{transaction.description || "No description"}</p>
                          {transaction.category && (
                            <Badge variant="outline" className="text-xs">
                              {transaction.category}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 text-muted-foreground text-sm">
                          <span>{new Date(transaction.date).toLocaleDateString()}</span>
                          <span>•</span>
                          <Badge
                            variant={
                              transaction.status === "completed"
                                ? "default"
                                : transaction.status === "pending"
                                  ? "secondary"
                                  : "destructive"
                            }
                            className="text-xs"
                          >
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Amount and type badge */}
                    <div className="space-y-1 text-right">
                      <p
                        className={`font-semibold ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}
                      >
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(transaction.amount, transaction.currency || "USD")}
                      </p>
                      <Badge variant={transaction.type === "income" ? "default" : "secondary"} className="text-xs">
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
                <Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
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
        )}
      </CardContent>
    </Card>
  );
}
