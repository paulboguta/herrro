import { revalidatePath } from "next/cache";

import { db } from "@/server/db";
import { api } from "@/trpc/server";

export async function CreateTransaction() {
  const accounts = await db.query.account_table.findMany({
    orderBy: (t, { asc }) => [asc(t.name)],
  });

  async function createTransactionAction(formData: FormData) {
    "use server";

    const getStr = (key: string, fallback = "") => {
      const v = formData.get(key);
      return typeof v === "string" ? v : fallback;
    };

    const account = getStr("account");
    const date = getStr("date");
    const type = getStr("type");
    const amount = getStr("amount");
    const currency = getStr("currency", "USD");
    const category = getStr("category");
    const descVal = formData.get("description");
    const description = typeof descVal === "string" && descVal.length > 0 ? descVal : null;

    if (!account || !date || !type || !amount || !category) return;

    await api.transaction.create({
      account,
      date,
      type: type as "income" | "expense" | "transfer",
      amount,
      currency,
      category,
      description,
    });

    revalidatePath("/");
  }

  return (
    <form action={createTransactionAction} className="flex flex-col gap-2">
      <select name="account" className="rounded-md border px-3 py-2" required defaultValue="">
        <option value="" disabled>
          Select account
        </option>
        {accounts.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name}
          </option>
        ))}
      </select>
      <input name="date" type="date" className="rounded-md border px-3 py-2" required />
      <select name="type" className="rounded-md border px-3 py-2" required>
        <option value="income">income</option>
        <option value="expense">expense</option>
        <option value="transfer">transfer</option>
      </select>
      <input name="amount" type="number" step="0.01" className="rounded-md border px-3 py-2" placeholder="Amount" required />
      <input name="currency" type="text" className="rounded-md border px-3 py-2" placeholder="USD" />
      <input name="category" type="text" className="rounded-md border px-3 py-2" placeholder="Category" required />
      <input name="description" type="text" className="rounded-md border px-3 py-2" placeholder="Description (optional)" />
      <button type="submit" className="rounded-md bg-black px-3 py-2 text-white">
        Create transaction
      </button>
    </form>
  );
}
