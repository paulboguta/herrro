import { Button } from "@/components/ui/button";
import PageHeader from "@/components/ui/page-header";
import { Toolbar } from "@/components/ui/toolbar";
import { api, HydrateClient } from "@/trpc/server";
import { PlusIcon } from "lucide-react";
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
      <div className="space-y-4">
        <Toolbar>
          <Button variant="outline" size="sm">
            <PlusIcon />
            Add
          </Button>
        </Toolbar>
        <Suspense fallback={<div>Loading...</div>}>
          <TransactionsContents />
        </Suspense>
      </div>
    </HydrateClient>
  );
}
