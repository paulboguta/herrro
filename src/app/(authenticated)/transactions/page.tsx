import PageHeader from "@/components/ui/page-header";
import { api, HydrateClient } from "@/trpc/server";
import { Suspense } from "react";
import TransactionsContents from "./_transactions-contents";

export const dynamic = "force-dynamic";

export default function Transactions() {
  void api.transaction.getAllForPeriod.prefetch({
    period: "1m", // prefetch transactions for the last month
  });

  return (
    <HydrateClient>
      <PageHeader title="Transactions" />
      <Suspense fallback={<div>Loading...</div>}>
        <TransactionsContents />
      </Suspense>
    </HydrateClient>
  );
}
