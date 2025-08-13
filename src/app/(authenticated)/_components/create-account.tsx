import { revalidatePath } from "next/cache";

import { api } from "@/trpc/server";

export async function CreateAccount() {
  async function createAccountAction(formData: FormData) {
    "use server";

    const v = formData.get("name");
    const name = typeof v === "string" ? v.trim() : "";
    if (!name) return;

    await api.account.create({ name });

    revalidatePath("/");
  }

  return (
    <form action={createAccountAction} className="flex flex-col gap-2">
      <input
        name="name"
        type="text"
        placeholder="Account name"
        className="rounded-md border px-3 py-2"
        required
      />
      <button
        type="submit"
        className="rounded-md bg-black px-3 py-2 text-white"
      >
        Create account
      </button>
    </form>
  );
}
