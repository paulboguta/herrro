import {
	pgTable,
	text,
	timestamp,
	decimal,
	pgEnum,
	uuid,
	bigint,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { z } from "zod";

// Account category enum
export const accountCategoryEnum = pgEnum("account_category", [
	"asset",
	"liability",
]);

// Updated account type enum with new types while preserving existing ones
export const accountTypeEnum = pgEnum("account_type", [
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

export const accounts = pgTable("accounts", {
	id: uuid("id").defaultRandom().primaryKey(),
	userId: text("user_id").notNull(),
	name: text("name").notNull(),
	type: accountTypeEnum("type").notNull(),
	category: accountCategoryEnum("category").notNull(),
	currency: text("currency").notNull().default("USD"),
	balance: decimal("balance", { precision: 19, scale: 4 })
		.notNull()
		.default("0"),
	startingBalance: decimal("starting_balance", { precision: 19, scale: 4 })
		.notNull()
		.default("0"),
	balanceVersion: bigint("balance_version", { mode: "number" })
		.notNull()
		.default(0),
	createdAt: timestamp("created_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
	archivedAt: timestamp("archived_at", { withTimezone: true }),
});

// Transaction type enum
export const transactionTypeEnum = pgEnum("transaction_type", [
	"income",
	"expense",
]);

// Transaction status enum
export const transactionStatusEnum = pgEnum("transaction_status", [
	"pending",
	"completed", 
	"failed",
]);

export const transactions = pgTable("transactions", {
	id: uuid("id").defaultRandom().primaryKey(),
	userId: text("user_id").notNull(),
	accountId: uuid("account_id")
		.notNull()
		.references(() => accounts.id, { onDelete: "cascade" }),
	amount: decimal("amount", { precision: 19, scale: 4 }).notNull(),
	type: transactionTypeEnum("type").notNull(),
	status: transactionStatusEnum("status").notNull().default("completed"),
	category: text("category"),
	currency: text("currency").notNull().default("USD"),
	description: text("description"),
	date: timestamp("date", { withTimezone: true }).notNull(),
	runningBalance: decimal("running_balance", { precision: 19, scale: 4 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
});

// Relations
export const accountsRelations = relations(accounts, ({ many }) => ({
	transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
	account: one(accounts, {
		fields: [transactions.accountId],
		references: [accounts.id],
	}),
}));