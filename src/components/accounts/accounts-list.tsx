"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AccountCard } from "./account-card";
import { CreateAccountForm } from "./create-account-form";
import { api } from "@/trpc/react";
import { accountKeys } from "@/lib/cache-keys";
import { Suspense } from "react";

// Loading skeleton component
function AccountsListSkeleton() {
	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			{Array.from({ length: 6 }).map((_, i) => (
				<Card key={i} className="h-32">
					<CardContent className="flex items-center justify-center h-full">
						<div className="animate-pulse bg-muted rounded h-4 w-24" />
					</CardContent>
				</Card>
			))}
		</div>
	);
}

function AccountsContent() {
	// Use optimized query with better cache configuration
	const { data: accounts, isLoading, error } = api.account.getAll.useQuery(
		undefined,
		{
			// Use longer stale time for account data as it changes infrequently
			staleTime: 5 * 60 * 1000, // 5 minutes
			// Keep data in cache longer to avoid refetching on navigation
			cacheTime: 30 * 60 * 1000, // 30 minutes
			// Prefetch related data on hover
			onSuccess: (data) => {
				// Prefetch recent transactions for each account
				data.forEach((account) => {
					void api.transaction.getByAccount.prefetch({
						accountId: account.id,
						limit: 10,
						offset: 0,
					});
				});
			},
			// Show stale data while refetching in background
			refetchOnWindowFocus: false,
			refetchOnMount: false,
		}
	);

	if (error) {
		return (
			<Card className="flex h-64 items-center justify-center">
				<CardContent className="text-center">
					<h3 className="font-semibold text-lg text-destructive">Error loading accounts</h3>
					<p className="text-muted-foreground">{error.message}</p>
				</CardContent>
			</Card>
		);
	}

	if (isLoading) {
		return <AccountsListSkeleton />;
	}

	if (!accounts || accounts.length === 0) {
		return (
			<Card className="flex h-64 items-center justify-center">
				<CardContent className="text-center">
					<h3 className="font-semibold text-lg">No accounts yet</h3>
					<p className="mb-4 text-muted-foreground">
						Create your first financial account to get started
					</p>
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
