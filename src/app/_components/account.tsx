"use client";

import { useState } from "react";

import { api } from "@/trpc/react";

export function AccountManager() {
	const [accounts] = api.account.getAll.useSuspenseQuery();

	const utils = api.useUtils();
	const [name, setName] = useState("");
	const [type, setType] = useState<"checking" | "savings" | "credit" | "investment" | "loan" | "other">("checking");
	const createAccount = api.account.create.useMutation({
		onSuccess: async () => {
			await utils.account.invalidate();
			setName("");
			setType("checking");
		},
	});

	return (
		<div className="w-full max-w-xs">
			{accounts && accounts.length > 0 ? (
				<div className="mb-4">
					<h3 className="mb-2 font-semibold">Your Accounts:</h3>
					{accounts.map((account) => (
						<div key={account.id} className="mb-2 rounded bg-white/5 p-2">
							<div className="flex justify-between">
								<span>{account.name}</span>
								<span>{account.type}</span>
							</div>
							<div className="text-gray-300 text-sm">
								{account.currency} {account.balance}
							</div>
						</div>
					))}
				</div>
			) : (
				<p>You have no accounts yet.</p>
			)}
			<form
				onSubmit={(e) => {
					e.preventDefault();
					createAccount.mutate({ name, type });
				}}
				className="flex flex-col gap-2"
			>
				<input
					type="text"
					placeholder="Account Name"
					value={name}
					onChange={(e) => setName(e.target.value)}
					className="w-full rounded-full bg-white/10 px-4 py-2 text-white"
				/>
				<select
					value={type}
					onChange={(e) => setType(e.target.value)}
					className="w-full rounded-full bg-white/10 px-4 py-2 text-white"
				>
					<option value="checking">Checking</option>
					<option value="savings">Savings</option>
					<option value="credit">Credit</option>
					<option value="investment">Investment</option>
					<option value="loan">Loan</option>
					<option value="other">Other</option>
				</select>
				<button
					type="submit"
					className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
					disabled={createAccount.isPending}
				>
					{createAccount.isPending ? "Creating..." : "Create Account"}
				</button>
			</form>
		</div>
	);
}
