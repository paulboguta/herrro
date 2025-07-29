import { AccountsList } from "@/app/_components/accounts/accounts-list";
import { CreateAccountForm } from "@/app/_components/accounts/create-account-form";
import { SiteHeader } from "@/components/ui/site-header";
import { HydrateClient, api } from "@/trpc/server";

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
              <AccountsList />
            </div>
          </div>
        </div>
      </div>
    </HydrateClient>
  );
}
