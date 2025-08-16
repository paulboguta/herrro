"use client";

import { api } from "@/trpc/react";

export default function AccountContents({accountId}: {accountId: string}) {
  const [account] = api.account.getById.useSuspenseQuery(accountId);
  const [transactions] = api.transaction.getByAccountId.useSuspenseQuery(accountId);

  return (
    <div className="flex flex-col items-center justify-center">
      {account?.name}
      {
        transactions ?
          transactions.map((transaction) => (
            <div key={transaction.id} className="flex gap-2 max-w-lg w-full justify-between">
              <div>{transaction.description}</div>
              <div>{transaction.amount}</div>
            </div>
          )) : <div>No transactions</div>
        }
    </div>
  );
}
