import { api } from "@/trpc/server";

export default async function AccountPage({
  params,
}: {
  params: Promise<{ accountId: string }>;
}) {
  const { accountId } = await params;

  const account = await api.account.getById(accountId);

  const transactions = await api.transaction.getByAccountId(accountId);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      {account?.name}
      {
          transactions.map((transaction) => (
            <div key={transaction.id} className="flex gap-2 max-w-lg w-full justify-between">
              <div>{transaction.description}</div>
              <div>{transaction.amount}</div>
            </div>
          ))
        }
    </main>
  );
}
