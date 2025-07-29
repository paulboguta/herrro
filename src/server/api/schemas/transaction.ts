import { z } from "zod";

export const transactionTypeSchema = z.enum(["income", "expense"]);

export const transactionStatusSchema = z.enum(["pending", "completed", "failed"]);

export const createTransactionSchema = z.object({
	accountId: z.string().uuid(),
	amount: z.string().regex(/^\d+(\.\d{1,4})?$/),
	type: transactionTypeSchema,
	status: transactionStatusSchema.default("completed"),
	category: z.string().optional(),
	currency: z.string().default("USD"),
	description: z.string().optional(),
	date: z.string().transform((str) => {
		console.log("📅 Transforming date string:", str);
		const date = new Date(str);
		console.log("📅 Transformed to date:", date);
		return date;
	}),
});

export const updateTransactionSchema = z.object({
	accountId: z.string().uuid().optional(),
	amount: z.string().regex(/^\d+(\.\d{1,4})?$/).optional(),
	type: transactionTypeSchema.optional(),
	status: transactionStatusSchema.optional(),
	category: z.string().optional(),
	currency: z.string().optional(),
	description: z.string().optional(),
	date: z.string().transform((str) => new Date(str)).optional(),
});

export const getTransactionSchema = z.object({
	id: z.string().uuid(),
});

export const getTransactionsByAccountSchema = z.object({
	accountId: z.string().uuid(),
	limit: z.number().min(1).max(100).default(50),
	offset: z.number().min(0).default(0),
});

export const getAllTransactionsSchema = z.object({
	limit: z.number().min(1).max(100).default(50),
	offset: z.number().min(0).default(0),
});