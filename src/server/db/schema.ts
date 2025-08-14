import { sql } from "drizzle-orm";
import { index, pgTable, uniqueIndex } from "drizzle-orm/pg-core";

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

export const category_table = pgTable(
  "category",
  (d) => ({
    id: d.uuid().primaryKey().defaultRandom(),
    name: d.varchar({ length: 100 }).notNull(),
    ownerId: d.text().notNull(), // clerk user id
    isDefault: d.boolean().default(false),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("category_owner_idx").on(t.ownerId),
    uniqueIndex("category_name_owner_unique").on(t.name, t.ownerId),
  ]
);

export const merchant_table = pgTable(
  "merchant",
  (d) => ({
    id: d.uuid().primaryKey().defaultRandom(),
    name: d.varchar({ length: 100 }).notNull(),
    website: d.varchar({ length: 255 }),
    logoUrl: d.varchar({ length: 500 }),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    uniqueIndex("merchant_name_unique").on(t.name),
  ]
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
    categoryId: d.uuid().references(() => category_table.id),
    merchantId: d.uuid().references(() => merchant_table.id),
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

export type Transaction = typeof transaction_table.$inferSelect;
