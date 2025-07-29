import { CreateTransactionForm } from "@/components/transactions/create-transaction-form";
import { TransactionsList } from "@/components/transactions/transactions-list";
import { SiteHeader } from "@/components/ui/site-header";

export default function TransactionsPage() {
	const breadcrumbs = [
		{ label: "Transactions" }
	];

	return (
		<>
			<SiteHeader 
				breadcrumbs={breadcrumbs}
				actions={<CreateTransactionForm />}
			/>
			<div className="flex flex-1 flex-col">
				<div className="@container/main flex flex-1 flex-col gap-2">
					<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
						<div className="px-4 lg:px-6">
							<div>
								<h1 className="font-bold text-2xl">Transactions</h1>
								<p className="text-muted-foreground">
									Track your income and expenses across all accounts
								</p>
							</div>
						</div>
						<div className="px-4 lg:px-6">
							<TransactionsList />
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
