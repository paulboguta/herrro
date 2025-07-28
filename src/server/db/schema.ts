import {
	pgTable,
	text,
	timestamp,
	decimal,
	pgEnum,
	uuid,
} from "drizzle-orm/pg-core";
import { z } from "zod";

export const accountTypeEnum = pgEnum("account_type", [
	"checking",
	"savings",
	"credit",
	"investment",
	"loan",
	"other",
]);

export const accounts = pgTable("accounts", {
	id: uuid("id").defaultRandom().primaryKey(),
	userId: text("user_id").notNull(),
	name: text("name").notNull(),
	type: accountTypeEnum("type").notNull(),
	currency: text("currency").notNull().default("USD"),
	balance: decimal("balance", { precision: 19, scale: 4 })
		.notNull()
		.default("0"),
	createdAt: timestamp("created_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
	archivedAt: timestamp("archived_at", { withTimezone: true }),
});