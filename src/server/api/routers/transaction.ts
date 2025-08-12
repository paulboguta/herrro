
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const transactionRouter = createTRPCRouter({
    // create: publicProcedure
    // .input(z.object({ name: z.string().min(1) }))
    // .mutation(async ({ ctx, input }) => {
    //   await ctx.db.insert(posts).values({
    //     name: input.name,
    //   });
    // }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    const transactions = await ctx.db.query.transactions.findMany({
      orderBy: (transactions, { desc }) => [desc(transactions.createdAt)],
    });

    return transactions ?? null;
  }),
});

