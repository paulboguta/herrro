"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { api } from "@/trpc/react";
import { formatCurrency } from "@/lib/utils";

interface AccountHeaderProps {
	accountId: string;
}

export function AccountHeader({ accountId }: AccountHeaderProps) {
	const {
		data: account,
		isLoading,
		error,
	} = api.account.getById.useQuery(
		{ id: accountId },
		{
			staleTime: 5 * 60 * 1000, // 5 minutes
		},
	);

	if (error) {
		return (
			<div className="text-center">
				<h1 className="font-bold text-2xl text-destructive">
					Account not found
				</h1>
				<p className="text-muted-foreground">{error.message}</p>
				<Link href="/accounts">
					<Button variant="outline" className="mt-4">
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back to Accounts
					</Button>
				</Link>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="space-y-4">
				<div className="flex items-center gap-4">
					<div className="h-10 w-10 animate-pulse rounded bg-muted" />
					<div className="space-y-2">
						<div className="h-6 w-48 animate-pulse rounded bg-muted" />
						<div className="h-4 w-32 animate-pulse rounded bg-muted" />
					</div>
				</div>
				<div className="h-32 animate-pulse rounded bg-muted" />
			</div>
		);
	}

	if (!account) {
		return null;
	}

	return (
		<div className="space-y-6">
			{/* Account info header */}
			<div className="space-y-2">
				<div className="flex items-center gap-3">
					<h1 className="font-bold text-3xl">{account.name}</h1>
					<div className="flex gap-2">
						<Badge
							variant={account.category === "asset" ? "default" : "destructive"}
							className="capitalize"
						>
							{account.category}
						</Badge>
						<Badge variant="outline" className="capitalize">
							{account.type.replace(/_/g, " ")}
						</Badge>
					</div>
				</div>
				<div className="flex items-center justify-between">
					<p className="text-muted-foreground text-sm">
						Created on {new Date(account.createdAt).toLocaleDateString()}
					</p>
					<p className="font-bold text-2xl">
						{formatCurrency(
							Number.parseFloat(account.balance),
							account.currency,
						)}
					</p>
				</div>
			</div>
		</div>
	);
}
