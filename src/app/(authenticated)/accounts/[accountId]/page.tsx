import { AccountChart } from "@/app/_components/accounts/account-chart";
import { AccountHeader } from "@/app/_components/accounts/account-header";
import { AccountTransactionsTable } from "@/app/_components/accounts/account-transactions-table";
import { CreateTransactionForm } from "@/app/_components/transactions/create-transaction-form";
import { SiteHeader } from "@/components/ui/site-header";
import { HydrateClient, api } from "@/trpc/server";
import { notFound } from "next/navigation";

interface AccountDetailPageProps {
  params: Promise<{
    accountId: string;
  }>;
}

export default async function AccountDetailPage({ params }: AccountDetailPageProps) {
  const { accountId } = await params;

  // Non-blocking prefetch for instant page render
  void api.account.getById.prefetch({ id: accountId });
  void api.transaction.getByAccount.prefetch({
    accountId,
    limit: 50,
    offset: 0,
  });

  const breadcrumbs = [{ label: "Accounts", href: "/accounts" }, { label: "[Account Name]" }];

  return (
    <HydrateClient>
      <SiteHeader breadcrumbs={breadcrumbs} actions={<CreateTransactionForm defaultAccountId={accountId} />} />
      <div className="flex flex-1 flex-col">
        <div className="@container/main mx-auto flex w-full max-w-5xl flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
              <AccountHeader accountId={accountId} />
            </div>
            <div className="px-4 lg:px-6">
              <AccountChart accountId={accountId} />
            </div>
            <div className="flex-1">
              <AccountTransactionsTable accountId={accountId} />
            </div>
          </div>
        </div>
      </div>
    </HydrateClient>
  );
}
