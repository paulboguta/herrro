import { ChartAreaInteractive } from "@/components/ui/chart-area-interactive"
import { TransactionsTable } from "@/components/ui/transactions-table"
import { SiteHeader } from "@/components/ui/site-header"
import transactionsData from "./transactions.json"
import { api, HydrateClient } from "@/trpc/server"

export default function Page() {
  void api.account.getAll.prefetch();
  
  return (
    <HydrateClient>
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            {/* <SectionCards /> */}
            <div className="px-4 lg:px-6">
              <ChartAreaInteractive />
            </div>
            <TransactionsTable data={transactionsData} />
          </div>
        </div>
      </div>
    </HydrateClient>
  )
}
