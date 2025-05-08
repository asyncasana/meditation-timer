import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";

// Remove this line:
// import { posts } from "@/server/db/schema";

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      // Remove database operation
      console.log(`Creating post: ${input.name} by ${ctx.session.user.id}`);
      return { success: true };
    }),

  getLatest: protectedProcedure.query(async ({ ctx }) => {
    // Return mock data
    return {
      id: "mock-post-id",
      name: "Example Post",
      createdAt: new Date(),
      createdById: ctx.session.user.id,
    };
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});