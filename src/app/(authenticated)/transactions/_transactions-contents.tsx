"use client";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/trpc/react";

export default function TransactionsContents() {
  const [transactions] = api.transaction.getAllForPeriod.useSuspenseQuery({
    period: "1w",
  });

  const uncategorizedTransactions = transactions.filter(
    (transaction) => transaction.category === null,
  );
  const categorizedTransactions = transactions.filter(
    (transaction) => transaction.category !== null,
  );

  return (
    <div>
      <Tabs defaultValue="uncategorized">
        <TabsList>
          <TabsTrigger value="uncategorized">
            Uncategorized
            <Badge>{uncategorizedTransactions.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="categorized">Categorized</TabsTrigger>
        </TabsList>
        <TabsContent value="uncategorized">
          <div>
            {uncategorizedTransactions.map((transaction) => (
              <div key={transaction.id}>
                <h1>{transaction.description}</h1>
                <p>{transaction.amount}</p>
              </div>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="categorized">
          <div>
            {categorizedTransactions.map((transaction) => (
              <div key={transaction.id}>
                <h1>{transaction.description}</h1>
                <p>{transaction.amount}</p>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
