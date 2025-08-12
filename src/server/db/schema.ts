import { sql } from "drizzle-orm";
import { index, pgTable } from "drizzle-orm/pg-core";

export const account_table = pgTable(
  "account",
  (d) => ({
    id: d.uuid().primaryKey().defaultRandom(),
    name: d.varchar({ length: 256 }).notNull(),
    ownerId: d.text(), // clerk user id
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
);

export const transaction_table = pgTable(
  "transaction",
  (d) => ({
    id: d.uuid().primaryKey().defaultRandom(),
    ownerId: d.text(), // clerk user id
    date: d.timestamp({ withTimezone: true }).notNull(),
    type: d.varchar({ length: 256 }).notNull(),
    amount: d.numeric({ precision: 12, scale: 2 }).notNull(),
    currency: d.varchar({ length: 256 }).notNull().default('USD'),
    category: d.varchar({ length: 256 }).notNull(),
    description: d.varchar({ length: 256 }),
    account: d.uuid().references(() => account_table.id, { onDelete: "cascade" }),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [index("account_idx").on(t.account), index("owner_idx").on(t.ownerId)],
);
