import { category_table } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const categoryRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.category_table.findMany({
      where: eq(category_table.ownerId, ctx.auth.userId!),
      orderBy: (categories, { asc }) => [asc(categories.name)],
    });
  }),
});