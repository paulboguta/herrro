import { notFound } from "next/navigation";
import { api, HydrateClient } from "@/trpc/server";
import { AccountHeader } from "@/components/accounts/account-header";
import { AccountChart } from "@/components/accounts/account-chart";
import { AccountTransactionsTable } from "@/components/accounts/account-transactions-table";

interface AccountDetailPageProps {
	params: {
		accountId: string;
	};
}

export default async function AccountDetailPage({ params }: AccountDetailPageProps) {
	// Validate UUID format
	const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
	if (!uuidRegex.test(params.accountId)) {
		notFound();
	}

	try {
		// Prefetch account data and recent transactions
		await Promise.all([
			api.account.getById.prefetch({ id: params.accountId }),
			api.transaction.getByAccount.prefetch({ 
				accountId: params.accountId, 
				limit: 50,
				offset: 0 
			}),
		]);
	} catch (error) {
		// If account doesn't exist or user doesn't have access, show 404
		notFound();
	}

	return (
		<HydrateClient>
			<div className="flex h-full flex-col">
				{/* Header section */}
				<div className="p-6">
					<AccountHeader accountId={params.accountId} />
				</div>

				{/* Chart section - full width */}
				<div className="px-6 pb-6">
					<AccountChart accountId={params.accountId} />
				</div>

				{/* Transactions section */}
				<div className="flex-1">
					<AccountTransactionsTable accountId={params.accountId} />
				</div>
			</div>
		</HydrateClient>
	);
}