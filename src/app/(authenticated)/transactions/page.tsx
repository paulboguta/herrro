import { DashboardTransactionsTable } from "@/components/dashboard/dashboard-transactions-table";
import { CreateTransactionForm } from "@/components/transactions/create-transaction-form";
import { SiteHeader } from "@/components/ui/site-header";
import { HydrateClient, api } from "@/trpc/server";

export default async function TransactionsPage() {
  void api.transaction.getInfinite.prefetch({ limit: 50 });

  const breadcrumbs = [{ label: "Transactions" }];

  return (
    <HydrateClient>
      <SiteHeader breadcrumbs={breadcrumbs} actions={<CreateTransactionForm />} />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <DashboardTransactionsTable />
          </div>
        </div>
      </div>
    </HydrateClient>
  );
}
