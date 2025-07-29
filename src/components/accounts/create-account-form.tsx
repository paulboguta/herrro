"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { api } from "@/trpc/react";
import { cacheInvalidation } from "@/lib/cache-utils";
import { accountKeys } from "@/lib/cache-keys";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(1, "Account name is required"),
  category: z.enum(["asset", "liability"]),
  type: z.enum([
    "checking",
    "savings",
    "credit",
    "investment",
    "loan",
    "other",
    "cash",
    "crypto",
    "property",
    "vehicle",
    "other_asset",
    "credit_card",
    "other_liability",
  ]),
  currency: z.string().min(1, "Currency is required"),
  initialBalance: z.string().regex(/^\d+(\.\d{1,4})?$/, "Please enter a valid initial balance"),
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
      category: "asset",
      type: "checking",
      currency: "USD",
      initialBalance: "0",
    },
  });

  const utils = api.useUtils();
  const createAccount = api.account.create.useMutation({
    onMutate: (newAccount) => {
      // Optimistic update: immediately add the account to the cache
      const optimisticAccount = {
        id: `temp-${Date.now()}`, // Temporary ID
        ...newAccount,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Update the cache optimistically
      utils.account.getAll.setData(undefined, (old) => {
        if (!old) return [optimisticAccount as any];
        return [optimisticAccount as any, ...old];
      });

      toast.success("Creating account...");
    },
    onSuccess: async (newAccount) => {
      // Replace optimistic data with real data
      utils.account.getAll.setData(undefined, (old) => {
        if (!old) return [newAccount];
        // Replace the optimistic entry with the real one
        return old.map((account) => (account.id.startsWith("temp-") ? newAccount : account));
      });

      // Smart invalidation - only invalidate related queries
      await cacheInvalidation.account.invalidateAll(utils.client);

      form.reset();
      setOpen(false);
      onSuccess?.();

      toast.success("Account created successfully!");
    },
    onError: (error) => {
      // Revert optimistic update on error
      utils.account.getAll.setData(undefined, (old) => {
        if (!old) return [];
        // Remove the optimistic entry
        return old.filter((account) => !account.id.startsWith("temp-"));
      });

      toast.error("Failed to create account", {
        description: error.message,
      });
    },
  });

  const handleSubmit = (data: FormData) => {
    // For new accounts, both starting balance and current balance should be the same
    const accountData = {
      name: data.name,
      category: data.category,
      type: data.type,
      currency: data.currency,
      balance: data.initialBalance,
      startingBalance: data.initialBalance,
    };

    createAccount.mutate(accountData);
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
          <DialogDescription>Add a new financial account to track your finances.</DialogDescription>
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
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      // Reset type when category changes
                      form.setValue("type", value === "asset" ? "checking" : "credit_card");
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="asset">Asset</SelectItem>
                      <SelectItem value="liability">Liability</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => {
                const category = form.watch("category");
                const assetTypes = [
                  { value: "checking", label: "Checking" },
                  { value: "savings", label: "Savings" },
                  { value: "cash", label: "Cash" },
                  { value: "investment", label: "Investment" },
                  { value: "crypto", label: "Cryptocurrency" },
                  { value: "property", label: "Property" },
                  { value: "vehicle", label: "Vehicle" },
                  { value: "other_asset", label: "Other Asset" },
                ];
                const liabilityTypes = [
                  { value: "credit_card", label: "Credit Card" },
                  { value: "loan", label: "Loan" },
                  { value: "credit", label: "Line of Credit" },
                  { value: "other_liability", label: "Other Liability" },
                ];
                const typeOptions = category === "liability" ? liabilityTypes : assetTypes;

                return (
                  <FormItem>
                    <FormLabel>Account Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {typeOptions.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

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
              name="initialBalance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Initial Balance</FormLabel>
                  <FormControl>
                    <Input placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                  <p className="text-muted-foreground text-xs">
                    This will be set as both your starting and current balance
                  </p>
                </FormItem>
              )}
            />

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
