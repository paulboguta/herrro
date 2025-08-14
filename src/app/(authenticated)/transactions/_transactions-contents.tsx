"use client";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/trpc/react";
import { EditTransaction } from "../_components/edit-transaction";

export default function TransactionsContents() {
  const [transactions] = api.transaction.getAllForPeriod.useSuspenseQuery({
    period: "1m",
  });

  const uncategorizedTransactions = transactions.filter(
    (transaction) => transaction.category === null,
  );
  const categorizedTransactions = transactions.filter(
    (transaction) => transaction.category !== null,
  );

  return (
    <div>
      <Tabs defaultValue="uncategorized" className="max-w-4xl">
        <TabsList>
          <TabsTrigger value="uncategorized">
            Uncategorized
            <Badge>{uncategorizedTransactions.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="categorized">Categorized</TabsTrigger>
        </TabsList>
        <TabsContent value="uncategorized">
          <div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {uncategorizedTransactions.map((transaction) => (
                  <EditTransaction
                    key={transaction.id}
                    transaction={transaction}
                  >
                    <TableRow>
                      <TableCell>
                        {transaction.date.toLocaleDateString()}
                      </TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>{transaction.category}</TableCell>
                      <TableCell>
                        {transaction.amount} {transaction.currency}
                      </TableCell>
                    </TableRow>
                  </EditTransaction>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        <TabsContent value="categorized">
          <div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categorizedTransactions.map((transaction) => (
                  <EditTransaction
                    key={transaction.id}
                    transaction={transaction}
                  >
                    <TableRow>
                      <TableCell>
                        {transaction.date.toLocaleDateString()}
                      </TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>{transaction.category}</TableCell>
                      <TableCell>{transaction.amount}</TableCell>
                    </TableRow>
                  </EditTransaction>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
