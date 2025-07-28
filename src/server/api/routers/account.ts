import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { accounts } from "@/server/db/schema";
import { createAccountSchema, updateAccountSchema, getAccountSchema } from "@/server/api/schemas/account";
import { eq } from "drizzle-orm";

export const accountRouter = createTRPCRouter({
	create: protectedProcedure
		.input(createAccountSchema)
		.mutation(async ({ ctx, input }) => {
			await ctx.db.insert(accounts).values({
				userId: ctx.user.id,
				name: input.name,
				type: input.type,
				currency: input.currency,
				balance: input.balance,
			});
		}),

	getAll: protectedProcedure.query(async ({ ctx }) => {
		return await ctx.db.query.accounts.findMany({
			orderBy: (accounts, { desc }) => [desc(accounts.createdAt)],
		});
	}),

	getById: protectedProcedure
		.input(getAccountSchema)
		.query(async ({ ctx, input }) => {
			const account = await ctx.db.query.accounts.findFirst({
				where: eq(accounts.id, input.id),
			});
			return account ?? null;
		}),

	update: protectedProcedure
		.input(getAccountSchema.merge(updateAccountSchema))
		.mutation(async ({ ctx, input }) => {
			const { id, ...updateData } = input;
			await ctx.db
				.update(accounts)
				.set(updateData)
				.where(eq(accounts.id, id));
		}),

	delete: protectedProcedure
		.input(getAccountSchema)
		.mutation(async ({ ctx, input }) => {
			await ctx.db
				.delete(accounts)
				.where(eq(accounts.id, input.id));
		}),
});