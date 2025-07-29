import { DashboardTransactionsTable } from "@/components/dashboard/dashboard-transactions-table";
import { ChartAreaInteractive } from "@/components/ui/chart-area-interactive";
import { SiteHeader } from "@/components/ui/site-header";
import { HydrateClient, api } from "@/trpc/server";

export default function Page() {
  // Non-blocking prefetch for instant page render
  void api.account.getAll.prefetch();
  void api.transaction.getInfinite.prefetch({ limit: 20 });

  return (
    <HydrateClient>
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
              <ChartAreaInteractive />
            </div>
            <DashboardTransactionsTable />
          </div>
        </div>
      </div>
    </HydrateClient>
  );
}
