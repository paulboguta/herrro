import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { seed } from "drizzle-seed";
import { Pool } from "pg";
import * as schema from "./schema";

const transactionCategories = [
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
  undefined,
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
      with: {
        transaction_table: [
          { weight: 0.6, count: [5, 15] },
          { weight: 0.3, count: [16, 30] },
          { weight: 0.1, count: [31, 50] },
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
        category: f.valuesFromArray({ values: transactionCategories }),
        description: f.companyName(),
        currency: f.default({ defaultValue: "USD" }),
        ownerId: f.default({ defaultValue: ownerId }),
      },
    },
  }));

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
