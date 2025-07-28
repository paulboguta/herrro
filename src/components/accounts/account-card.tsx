import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { RouterOutputs } from "@/trpc/react";

type Account = RouterOutputs["account"]["getAll"][0];

interface AccountCardProps {
	account: Account;
}

export function AccountCard({ account }: AccountCardProps) {
	return (
		<Card>
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<CardTitle className="text-lg">{account.name}</CardTitle>
					<Badge variant="outline" className="capitalize">
						{account.type}
					</Badge>
				</div>
				<CardDescription className="text-muted-foreground text-xs">
					Created {new Date(account.createdAt).toLocaleDateString()}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<span className="text-muted-foreground text-sm">Balance</span>
						<span className="font-semibold">
							{account.currency}{" "}
							{Number.parseFloat(account.balance).toLocaleString()}
						</span>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
