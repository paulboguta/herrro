import { AccountsList } from "@/components/accounts/accounts-list";
import { CreateAccountForm } from "@/components/accounts/create-account-form";

export default function AccountsPage() {
	return (
		<div className="flex h-full flex-col">
			<div className="flex items-center justify-between p-6">
				<div>
					<h1 className="font-bold text-2xl">Accounts</h1>
					<p className="text-muted-foreground">
						Manage your financial accounts
					</p>
				</div>
				<CreateAccountForm />
			</div>

			<div className="flex-1 px-6 pb-6">
				<AccountsList />
			</div>
		</div>
	);
}
