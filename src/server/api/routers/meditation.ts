import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";

export const meditationRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

// Add ESLint disable comments before each procedure:

  // Will be implemented later to record meditation sessions
  recordSession: protectedProcedure
  .input(z.object({ 
    durationMinutes: z.number().min(1),
    completed: z.boolean().default(true),
  }))
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  .mutation(async ({ ctx, input }) => {
    // For now, just log and return success
    console.log(`Recorded meditation: ${input.durationMinutes}min for ${ctx.session.user.id}`);
    return { success: true };
  }),

  // Get user's meditation stats
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getStats: protectedProcedure.query(async ({ ctx }) => {
    // Return mock stats for now
    return {
      totalSessions: 5,
      totalMinutes: 75,
      currentStreak: 3,
      longestStreak: 7,
    };
  }),