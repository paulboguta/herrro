"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AccountCard } from "./account-card";
import { CreateAccountForm } from "./create-account-form";
import { api } from "@/trpc/react";

export function AccountsList() {
	const { data: accounts, isLoading } = api.account.getAll.useQuery();

	if (isLoading) {
		return (
			<div className="flex h-64 items-center justify-center">
				<div className="text-muted-foreground">Loading accounts...</div>
			</div>
		);
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
