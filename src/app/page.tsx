import { api, HydrateClient } from "@/trpc/server";
import Link from "next/link";
import { CreateAccount } from "./_components/create-account";
import { CreateTransaction } from "./_components/create-transaction";

export default async function Home() {
  const transactions = await api.transaction.getAll();

  // void api.post.getLatest.prefetch();

  const accounts = await api.account.getAll();

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        {
          accounts.map((account) => (
            <div key={account.id} className="flex gap-2 max-w-lg w-full justify-between">
              <div>{account.name}</div>
              <Link href={`/account/${account.id}`}>View</Link>
            </div>
          ))
        }
        {
          transactions.map((transaction) => (
            <div key={transaction.id} className="flex gap-2 max-w-lg w-full justify-between">
              <div>{transaction.description}</div>
              <div>{transaction.amount}</div>
            </div>
          ))
        }
        <hr />
        <CreateTransaction />
        <CreateAccount />
      </main>
    </HydrateClient>
  );
}
