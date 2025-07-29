import { NetworthChart } from "@/app/_components/dashboard/networth-chart";
import { SiteHeader } from "@/components/ui/site-header";
import { HydrateClient, api } from "@/trpc/server";

export default function Page() {
  // Non-blocking prefetch for instant page render
  void api.account.getAll.prefetch();

  return (
    <HydrateClient>
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <div className="@container/main mx-auto flex w-full max-w-5xl flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
              <NetworthChart />
            </div>
          </div>
        </div>
      </div>
    </HydrateClient>
  );
}
