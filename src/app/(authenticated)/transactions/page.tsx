import { DataTableSkeleton } from "@/components/tables/base/data-table-skeleton";
import PageHeader from "@/components/ui/page-header";
import { api, HydrateClient } from "@/trpc/server";
import { startOfMonth } from "date-fns";
import { Suspense } from "react";
import { TransactionToolbar } from "./_toolbar";
import TransactionsContents from "./_transactions-contents";

export const dynamic = "force-dynamic";

export default function Transactions() {
  void api.transaction.getAllWithFilters.prefetch({
    startDate: startOfMonth(new Date()).toISOString(),
    endDate: new Date().toISOString(),
  });

  return (
    <HydrateClient>
      <PageHeader title="Transactions" />
      <div className="space-y-4">
        <TransactionToolbar />
        <Suspense fallback={<DataTableSkeleton columns={[120, 140, 150, 320, 20]} rows={5} />}>
          <TransactionsContents />
        </Suspense>
      </div>
    </HydrateClient>
  );
}
