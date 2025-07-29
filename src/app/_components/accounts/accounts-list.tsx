"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AccountCard } from "./account-card";
import { CreateAccountForm } from "./create-account-form";
import { api } from "@/trpc/react";
import { accountKeys } from "@/lib/cache-keys";
import { Suspense } from "react";

function AccountsListSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="h-32">
          <CardContent className="flex h-full items-center justify-center">
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function AccountsContent() {
  const [accounts] = api.account.getAll.useSuspenseQuery(undefined, {
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  if (!accounts || accounts.length === 0) {
    return (
      <Card className="flex h-64 items-center justify-center">
        <CardContent className="text-center">
          <h3 className="font-semibold text-lg">No accounts yet</h3>
          <p className="mb-4 text-muted-foreground">Create your first financial account to get started</p>
          <CreateAccountForm />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {accounts.map((account) => (
        <AccountCard key={account.id} account={account} />
      ))}
    </div>
  );
}

export function AccountsList() {
  return (
    <Suspense fallback={<AccountsListSkeleton />}>
      <AccountsContent />
    </Suspense>
  );
}
