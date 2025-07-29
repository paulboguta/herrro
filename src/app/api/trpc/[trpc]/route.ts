import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import type { NextRequest } from "next/server";

import { env } from "@/env";
import { appRouter } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a HTTP request (e.g. when you make requests from Client Components).
 */
const createContext = async (req: NextRequest) => {
  return createTRPCContext({
    headers: req.headers,
  });
};

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createContext(req),
    onError:
      env.NODE_ENV === "development"
        ? ({ path, error }) => {
            console.error(`❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`);
          }
        : undefined,
    responseMeta(opts) {
      const { ctx, paths, errors, type } = opts;
      // Cache successful query responses for 5 minutes
      if (type === "query" && errors.length === 0 && paths) {
        const path = paths[0];
        // Cache account and transaction queries
        if (path?.includes("account.getAll") || path?.includes("transaction.getInfinite")) {
          return {
            headers: {
              "cache-control": "s-maxage=300, stale-while-revalidate=1800", // 5min cache, 30min stale
            },
          };
        }
      }
      return {};
    },
  });

export { handler as GET, handler as POST };
