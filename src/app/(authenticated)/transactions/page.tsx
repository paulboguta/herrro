import { CreateTransactionForm } from "@/components/transactions/create-transaction-form";
import { TransactionsList } from "@/components/transactions/transactions-list";

export default function TransactionsPage() {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-bold text-3xl tracking-tight">Transactions</h1>
					<p className="text-muted-foreground">
						Track your income and expenses across all accounts
					</p>
				</div>
				<CreateTransactionForm />
			</div>

			<TransactionsList />
		</div>
	);
}
