import { createTRPCRouter } from "@/server/api/trpc";

// Import your routers here as you add them, e.g.:
// import { meditationRouter } from "./routers/meditation";

export const appRouter = createTRPCRouter({
  // meditation: meditationRouter,
  // Add more routers here as needed
});

// Export type definition of API
export type AppRouter = typeof appRouter;


// Added because server.ts requires a createCaller function
export const createCaller = (context: any) => appRouter.createCaller(context);