
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { account_table } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const accountRouter = createTRPCRouter({
    // create: publicProcedure
    // .input(z.object({ name: z.string().min(1) }))
    // .mutation(async ({ ctx, input }) => {
    //   await ctx.db.insert(posts).values({
    //     name: input.name,
    //   });
    // }),

  getById: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const account = await ctx.db.query.accounts.findFirst({
      where: eq(account_table.id, input),
    });

    return account ?? null;
  }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    const accounts = await ctx.db.query.accounts.findMany({
      orderBy: (accounts, { desc }) => [desc(accounts.name)],
    });

    return accounts ?? null;
  }),
});

