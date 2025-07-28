import { z } from "zod";

export const accountTypeSchema = z.enum([
	"checking",
	"savings", 
	"credit",
	"investment",
	"loan",
	"other",
]);

export const createAccountSchema = z.object({
	name: z.string().min(1),
	type: accountTypeSchema,
	currency: z.string().default("USD"),
	balance: z.string().regex(/^\d+(\.\d{1,4})?$/).default("0"),
});

export const updateAccountSchema = z.object({
	name: z.string().min(1).optional(),
	type: accountTypeSchema.optional(),
	currency: z.string().optional(),
	balance: z.string().regex(/^\d+(\.\d{1,4})?$/).optional(),
});

export const getAccountSchema = z.object({
	id: z.string().uuid(),
});