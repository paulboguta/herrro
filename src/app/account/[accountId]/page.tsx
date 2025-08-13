import { api, HydrateClient } from "@/trpc/server";
import AccountContents from "./_account-contents";

export default async function AccountPage({
  params,
}: {
  params: Promise<{ accountId: string }>;
}) {
  const { accountId } = await params;
  void api.transaction.getByAccountId.prefetch(accountId);
  void api.account.getById.prefetch(accountId);

  return (
    <HydrateClient>
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <AccountContents accountId={accountId} />
    </main>
    </HydrateClient>
  );
}
