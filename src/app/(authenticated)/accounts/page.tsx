import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import PageHeader from "@/components/ui/page-header";
import { api } from "@/trpc/server";
import Link from "next/link";

export default async function Accounts() {
  const accounts = await api.account.getAll();

  return (
    <>
      <PageHeader title="Accounts" />
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          {accounts.map((account) => (
            <Link
              prefetch={true}
              href={`/accounts/${account.id}`}
              key={account.id}
            >
              <Card key={account.id} className="aspect-video rounded-xl">
                <CardHeader>
                  <CardTitle>{account.name}</CardTitle>
                </CardHeader>
              </Card>
            </Link>
          ))}
      </div>
    </>
  );
}
