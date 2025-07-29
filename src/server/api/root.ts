import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { accountRouter } from "./routers/account";
import { transactionRouter } from "./routers/transaction";

export const appRouter = createTRPCRouter({
  account: accountRouter,
  transaction: transactionRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
