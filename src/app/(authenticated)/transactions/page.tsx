import { CreateTransactionForm } from "@/components/transactions/create-transaction-form";
import { TransactionsList } from "@/components/transactions/transactions-list";
import { SiteHeader } from "@/components/ui/site-header";
import { api, HydrateClient } from "@/trpc/server";
import { Suspense } from "react";

function TransactionSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between rounded-lg border p-4">
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

export default async function TransactionsPage() {
  void api.transaction.getInfinite.prefetch({ limit: 50 });

  const breadcrumbs = [{ label: "Transactions" }];

  return (
    <HydrateClient>
      <SiteHeader breadcrumbs={breadcrumbs} actions={<CreateTransactionForm />} />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
              <div>
                <h1 className="font-bold text-2xl">Transactions</h1>
                <p className="text-muted-foreground">Track your income and expenses across all accounts</p>
              </div>
            </div>
            <div className="px-4 lg:px-6">
              <Suspense fallback={<TransactionSkeleton />}>
                <TransactionsList />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </HydrateClient>
  );
}
