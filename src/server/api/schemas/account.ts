import { z } from "zod";

export const accountCategorySchema = z.enum([
	"asset",
	"liability",
]);

export const accountTypeSchema = z.enum([
	// Existing types (preserved for backward compatibility)
	"checking",
	"savings", 
	"credit",
	"investment",
	"loan",
	"other",
	// New asset types
	"cash",
	"crypto",
	"property",
	"vehicle",
	"other_asset",
	// New liability types
	"credit_card",
	"other_liability",
]);

export const createAccountSchema = z.object({
	name: z.string().min(1),
	type: accountTypeSchema,
	category: accountCategorySchema,
	currency: z.string().default("USD"),
	balance: z.string().regex(/^\d+(\.\d{1,4})?$/).default("0"),
	startingBalance: z.string().regex(/^\d+(\.\d{1,4})?$/).default("0"),
});

export const updateAccountSchema = z.object({
	name: z.string().min(1).optional(),
	type: accountTypeSchema.optional(),
	category: accountCategorySchema.optional(),
	currency: z.string().optional(),
	balance: z.string().regex(/^\d+(\.\d{1,4})?$/).optional(),
	startingBalance: z.string().regex(/^\d+(\.\d{1,4})?$/).optional(),
});

export const getAccountSchema = z.object({
	id: z.string().uuid(),
});