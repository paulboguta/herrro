
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { Transaction } from "@/server/db/schema";
import { api } from "@/trpc/react";

export function EditTransaction({
  children,
  transaction,
}: {
  children: React.ReactNode;
  transaction: Transaction; // temporary
}) {
 const {data: accounts, isLoading} = api.account.getAll.useQuery();


  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent showOverlay={false}>
        <SheetHeader>
          <SheetTitle>Edit Transaction</SheetTitle>
        </SheetHeader>
        <form className="flex flex-col gap-2">
          <select
            name="account"
            className="rounded-md border px-3 py-2"
            required
            defaultValue=""
          >
            <option value="" disabled>
              Select account
            </option>
            {accounts?.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
          <input
            name="date"
            type="date"
            className="rounded-md border px-3 py-2"
            required
          />
          <select name="type" className="rounded-md border px-3 py-2" required>
            <option value="income">income</option>
            <option value="expense">expense</option>
            <option value="transfer">transfer</option>
          </select>
          <input
            name="amount"
            type="number"
            step="0.01"
            className="rounded-md border px-3 py-2"
            placeholder="Amount"
            required
            defaultValue={transaction.amount}
          />
          <input
            name="currency"
            type="text"
            className="rounded-md border px-3 py-2"
            placeholder="USD"
            defaultValue={transaction.currency}
          />
          <input
            name="category"
            type="text"
            className="rounded-md border px-3 py-2"
            placeholder="Category"
            required
            defaultValue={transaction.categoryId ?? ""}
          />
          <input
            name="description"
            type="text"
            className="rounded-md border px-3 py-2"
            placeholder="Description (optional)"
            defaultValue={transaction.description ?? ""}
            />
          <button
            type="submit"
            className="rounded-md bg-black px-3 py-2 text-white"
          >
            Create transaction
          </button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
