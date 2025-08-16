"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { Transaction } from "@/server/db/schema";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const editTransactionSchema = z.object({
  account: z.string().uuid(),
  date: z.string().min(1),
  type: z.enum(["income", "expense", "transfer"]),
  amount: z.string().min(1),
  currency: z.string().min(1),
  categoryId: z.string().uuid(),
  description: z.string().optional(),
});

type EditTransactionForm = z.infer<typeof editTransactionSchema>;

interface EditTransactionProps {
  children?: React.ReactNode;
  transaction: Transaction;
  onSuccess?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function EditTransaction({ 
  children, 
  transaction, 
  onSuccess,
  open,
  onOpenChange
}: EditTransactionProps) {
  const { data: accounts } = api.account.getAll.useQuery();
  const { data: categories } = api.category.getAll.useQuery();
  const utils = api.useUtils();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditTransactionForm>({
    resolver: zodResolver(editTransactionSchema),
    defaultValues: {
      account: transaction.account ?? "",
      date: transaction.date.toISOString().split('T')[0],
      type: transaction.type as "income" | "expense" | "transfer",
      amount: transaction.amount ?? "",
      currency: transaction.currency ?? "",
      categoryId: transaction.categoryId ?? "",
      description: transaction.description ?? "",
    },
  });

  const updateTransaction = api.transaction.update.useMutation({
    onSuccess: async () => {
      await utils.transaction.invalidate();
      onSuccess?.();
      onOpenChange?.(false);
      reset();
    },
  });

  const onSubmit = (data: EditTransactionForm) => {
    updateTransaction.mutate({
      id: transaction.id,
      ...data,
      description: data.description ?? null,
    });
  };


  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {children && (
        <SheetTrigger asChild>
          {children}
        </SheetTrigger>
      )}
      <SheetContent showOverlay={true}>
        <SheetHeader>
          <SheetTitle>Edit Transaction</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-4">
          <div className="grid gap-2">
            <label htmlFor="account" className="text-sm font-medium">Account</label>
            <select
              id="account"
              {...register("account")}
              className="rounded-md border px-3 py-2"
            >
              <option value="">Select account</option>
              {accounts?.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
            {errors.account && (
              <p className="text-sm text-red-600">{errors.account.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <label htmlFor="date" className="text-sm font-medium">Date</label>
            <Input
              id="date"
              type="date"
              {...register("date")}
            />
            {errors.date && (
              <p className="text-sm text-red-600">{errors.date.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <label htmlFor="type" className="text-sm font-medium">Type</label>
            <select
              id="type"
              {...register("type")}
              className="rounded-md border px-3 py-2"
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
              <option value="transfer">Transfer</option>
            </select>
            {errors.type && (
              <p className="text-sm text-red-600">{errors.type.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <label htmlFor="amount" className="text-sm font-medium">Amount</label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register("amount")}
            />
            {errors.amount && (
              <p className="text-sm text-red-600">{errors.amount.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <label htmlFor="currency" className="text-sm font-medium">Currency</label>
            <Input
              id="currency"
              placeholder="USD"
              {...register("currency")}
            />
            {errors.currency && (
              <p className="text-sm text-red-600">{errors.currency.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <label htmlFor="categoryId" className="text-sm font-medium">Category</label>
            <select
              id="categoryId"
              {...register("categoryId")}
              className="rounded-md border px-3 py-2"
            >
              <option value="">Select category</option>
              {categories?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="text-sm text-red-600">{errors.categoryId.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <label htmlFor="description" className="text-sm font-medium">Description</label>
            <Input
              id="description"
              placeholder="Optional description"
              {...register("description")}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => reset()}
              disabled={isSubmitting}
              className="flex-1"
            >
              Reset
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || updateTransaction.isPending}
              className="flex-1"
            >
              {isSubmitting || updateTransaction.isPending ? "Updating..." : "Update Transaction"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}