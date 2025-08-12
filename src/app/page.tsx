import { db } from "@/server/db";
import { transactions as transactionsSchema } from "@/server/db/schema";
import { HydrateClient } from "@/trpc/server";

export default async function Home() {
  // const hello = await api.post.hello({ text: "from tRPC" });

  // void api.post.getLatest.prefetch();

  const transactions = await db.select().from(transactionsSchema);

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        {
          transactions.map((transaction) => (
            <div key={transaction.id} className="flex gap-2 max-w-lg w-full justify-between">
              <div>{transaction.description}</div>
              <div>{transaction.amount}</div>
            </div>
          ))
        }
      </main>
    </HydrateClient>
  );
}
