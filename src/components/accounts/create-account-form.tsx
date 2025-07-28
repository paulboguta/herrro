"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { api } from "@/trpc/react";

const formSchema = z.object({
	name: z.string().min(1, "Account name is required"),
	type: z.enum(["checking", "savings", "credit", "investment", "loan", "other"]),
	currency: z.string().min(1, "Currency is required"),
	balance: z.string().regex(/^\d+(\.\d{1,4})?$/, "Please enter a valid balance"),
});

type FormData = z.infer<typeof formSchema>;

interface CreateAccountFormProps {
	onSuccess?: () => void;
}

export function CreateAccountForm({ onSuccess }: CreateAccountFormProps) {
	const [open, setOpen] = useState(false);

	const form = useForm<FormData>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			type: "checking",
			currency: "USD",
			balance: "0",
		},
	});

	const utils = api.useUtils();
	const createAccount = api.account.create.useMutation({
		onSuccess: async () => {
			await utils.account.invalidate();
			form.reset();
			setOpen(false);
			onSuccess?.();
		},
	});

	const handleSubmit = (data: FormData) => {
		createAccount.mutate(data);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>
					<Plus className="mr-2 h-4 w-4" />
					Add Account
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create New Account</DialogTitle>
					<DialogDescription>
						Add a new financial account to track your finances.
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Account Name</FormLabel>
									<FormControl>
										<Input placeholder="e.g., Main Checking" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="type"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Account Type</FormLabel>
									<Select onValueChange={field.onChange} defaultValue={field.value}>
										<FormControl>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="checking">Checking</SelectItem>
											<SelectItem value="savings">Savings</SelectItem>
											<SelectItem value="credit">Credit</SelectItem>
											<SelectItem value="investment">Investment</SelectItem>
											<SelectItem value="loan">Loan</SelectItem>
											<SelectItem value="other">Other</SelectItem>
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="currency"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Currency</FormLabel>
										<Select onValueChange={field.onChange} defaultValue={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="USD">USD</SelectItem>
												<SelectItem value="EUR">EUR</SelectItem>
												<SelectItem value="GBP">GBP</SelectItem>
												<SelectItem value="CAD">CAD</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="balance"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Initial Balance</FormLabel>
										<FormControl>
											<Input placeholder="0.00" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<div className="flex justify-end space-x-2 pt-4">
							<Button type="button" variant="outline" onClick={() => setOpen(false)}>
								Cancel
							</Button>
							<Button type="submit" disabled={createAccount.isPending}>
								{createAccount.isPending ? "Creating..." : "Create Account"}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}