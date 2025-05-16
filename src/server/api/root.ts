import { createTRPCRouter } from "@/server/api/trpc";
import { createTRPCContext } from "@/server/api/trpc";
// Import your routers here as you add them, e.g.:
// import { meditationRouter } from "./routers/meditation";

export const appRouter = createTRPCRouter({
  // meditation: meditationRouter,
  // Add more routers here as needed
});

// Export type definition of API
export type AppRouter = typeof appRouter;

// Use Awaited<ReturnType<...>> instead of inferAsyncReturnType
export type Context = Awaited<ReturnType<typeof createTRPCContext>>;
export const createCaller = (context: Context) => appRouter.createCaller(context);