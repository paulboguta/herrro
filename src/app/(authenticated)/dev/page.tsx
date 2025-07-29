import { DashboardTransactionsTable } from "@/app/_components/dashboard/dashboard-transactions-table";
import { NetworthChart } from "@/app/_components/dashboard/networth-chart";
import { SiteHeader } from "@/components/ui/site-header";
import { HydrateClient, api } from "@/trpc/server";

export default async function DevPage() {
  void api.transaction.getInfinite.prefetch({ limit: 50 });

  const breadcrumbs = [{ label: "Development" }];

  return (
    <HydrateClient>
      <SiteHeader breadcrumbs={breadcrumbs} />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
              <div>
                <h1 className="font-bold text-2xl">Development</h1>
                <p className="text-muted-foreground">
                  Development area for testing components and features
                </p>
              </div>
            </div>
            <div className="px-4 lg:px-6">
              <div className="overflow-hidden">
                <NetworthChart />
              </div>
            </div>
          </div>
        </div>
      </div>
    </HydrateClient>
  );
}