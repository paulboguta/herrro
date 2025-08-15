import "dotenv/config";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { seed } from "drizzle-seed";
import { Pool } from "pg";
import * as schema from "./schema";

const defaultCategories = [
  "Groceries",
  "Salary", 
  "Utilities",
  "Rent",
  "Entertainment",
  "Dining Out",
  "Transportation",
  "Shopping",
  "Healthcare",
  "Freelance Income",
];

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

const main = async () => {
  // Test user id
  const ownerId = "user_31BqLT7j5lQSBAL7Kq4M3YuGZb4";
  console.log("Seeding database...");

  await seed(db, schema).refine((f) => ({
    account_table: {
      count: 2,
      columns: {
        name: f.valuesFromArray({ values: ["Checking", "Savings"] }),
        ownerId: f.default({ defaultValue: ownerId }),
      },
    },
    category_table: {
      count: defaultCategories.length,
      columns: {
        name: f.valuesFromArray({ 
          values: defaultCategories,
          isUnique: true,
        }),
        ownerId: f.default({ defaultValue: ownerId }),
        isDefault: f.default({ defaultValue: false }),
      },
      with: {
        transaction_table: [
          { weight: 0.55, count: [4, 12] },
          { weight: 0.35, count: [13, 25] },
          { weight: 0.1, count: [26, 40], },
        ],
      },
    },
    transaction_table: {
      columns: {
        // Date within the last year
        date: f.date({
          minDate: new Date(
            new Date().setFullYear(new Date().getFullYear() - 1),
          ),
          maxDate: new Date(),
        }),
        // 75% expense, 25% income
        type: f.valuesFromArray({
          values: ["expense", "expense", "expense", "income"],
        }),
        amount: f.number({ minValue: 5, maxValue: 2500, precision: 100 }),
        description: f.companyName(),
        currency: f.default({ defaultValue: "USD" }),
        ownerId: f.default({ defaultValue: ownerId }),
      },
    },
  }));

  // Pick 1 random category
  const randomCategory = await db.select().from(schema.category_table).where(eq(schema.category_table.ownerId, ownerId)).limit(1);

  // Update the transactions with that random category to be uncategorized
  await db.update(schema.transaction_table).set({
    categoryId: null,
  }).where(eq(schema.transaction_table.categoryId, randomCategory[0]!.id));


  console.log("Database seeded successfully!");
};

if (process.env.NODE_ENV === "production") {
  console.error("Don't run this in production");
  process.exit(1);
}

main().catch((err) => {
  console.error("Error during seeding:", err);
  process.exit(1);
});
