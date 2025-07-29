import { notFound } from "next/navigation";
import { api, HydrateClient } from "@/trpc/server";
import { SiteHeader } from "@/components/ui/site-header";
import { AccountHeader } from "@/components/accounts/account-header";
import { AccountChart } from "@/components/accounts/account-chart";
import { AccountTransactionsTable } from "@/components/accounts/account-transactions-table";
import { CreateTransactionForm } from "@/components/transactions/create-transaction-form";

interface AccountDetailPageProps {
	params: Promise<{
		accountId: string;
	}>;
}

export default async function AccountDetailPage({ params }: AccountDetailPageProps) {
	const { accountId } = await params;

	console.log("🔍 Account detail page - accountId:", accountId);

	// biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
	let account;
	try {
		console.log("📡 Attempting to fetch account data...");
		
		// Prefetch account data and recent transactions
		await Promise.all([
			api.account.getById.prefetch({ id: accountId }),
			api.transaction.getByAccount.prefetch({ 
				accountId: accountId, 
				limit: 50,
				offset: 0 
			}),
		]);
		
		console.log("✅ Prefetch completed, using server-side caller...");
		
		// Use server-side caller directly - the api is already a caller on server side
		account = await api.account.getById({ id: accountId });
		
		console.log("✅ Account fetched successfully:", account?.name);
	} catch (error) {
		console.error("❌ Error fetching account:", error);
		// If account doesn't exist or user doesn't have access, show 404
		notFound();
	}

	const breadcrumbs = [
		{ label: "Accounts", href: "/accounts" },
		{ label: account?.name || "Account" }
	];

	return (
		<HydrateClient>
			<SiteHeader 
				breadcrumbs={breadcrumbs}
				actions={<CreateTransactionForm defaultAccountId={accountId} />}
			/>
			<div className="flex flex-1 flex-col">
				<div className="@container/main flex flex-1 flex-col gap-2">
					<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
						<div className="px-4 lg:px-6">
							<AccountHeader accountId={accountId} />
						</div>
						<div className="px-4 lg:px-6">
							<AccountChart accountId={accountId} />
						</div>
						<div className="flex-1">
							<AccountTransactionsTable accountId={accountId} />
						</div>
					</div>
				</div>
			</div>
		</HydrateClient>
	);
}