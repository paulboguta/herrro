import { AccountsList } from "@/components/accounts/accounts-list";
import { CreateAccountForm } from "@/components/accounts/create-account-form";
import { SiteHeader } from "@/components/ui/site-header";
import { api, HydrateClient } from "@/trpc/server";

export default async function AccountsPage() {
  void api.account.getAll.prefetch();

  const breadcrumbs = [{ label: "Accounts" }];

  return (
    <HydrateClient>
      <SiteHeader breadcrumbs={breadcrumbs} actions={<CreateAccountForm />} />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
              <div>
                <h1 className="font-bold text-2xl">Accounts</h1>
                <p className="text-muted-foreground">Manage your financial accounts</p>
              </div>
            </div>
            <div className="px-4 lg:px-6">
              <AccountsList />
            </div>
          </div>
        </div>
      </div>
    </HydrateClient>
  );
}
