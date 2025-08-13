import PageHeader from "@/components/ui/page-header";
import { api, HydrateClient } from "@/trpc/server";
import TransactionsContents from "./_transactions-contents";

export default async function Transactions() {
  void api.transaction.getAllForPeriod.prefetch({
    period: "1w",
  });

  return (
    <HydrateClient>
      <PageHeader title="Transactions" />
      <TransactionsContents />
    </HydrateClient>
  );
}
