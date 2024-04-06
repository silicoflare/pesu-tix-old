import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

const userZodedSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  email: z.string().optional(),
  emailVerified: z.string().optional(),
  image: z.string().optional(),
  prn: z.string().optional(),
  srn: z.string().optional(),
  program: z.string().optional(),
  branch_short_code: z.string().optional(),
  branch: z.string().optional(),
  semester: z.string().optional(),
  section: z.string().optional(),
  campus_code: z.number().optional(),
  campus: z.string().optional(),
  class: z.string().optional(),
  cycle: z.string().optional(),
  department: z.string().optional(),
  institute_name: z.string().optional(),
});

export const userRouter = createTRPCRouter({
  /**
   * Create a new user.
   * If the user already exists, return the existing user.
   */
  create: publicProcedure
    .input(userZodedSchema)
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findFirst({
        where: { OR: [{ prn: input.prn }, { srn: input.srn }] },
      });

      if (user) {
        return user;
      }

      return ctx.db.user.create({
        data: {
          name: input.name,
          prn: input.prn,
          srn: input.srn,
          program: input.program,
          branch_short_code: input.branch_short_code,
          branch: input.branch,
          semester: input.semester,
          section: input.section,
          campus_code: input.campus_code,
          campus: input.campus,
          class: input.class,
          cycle: input.cycle,
          department: input.department,
          institute_name: input.institute_name,
        },
      });
    }),

  /**
   * Get a user by their ID.
   */
  getById: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return ctx.db.user.findFirst({
        where: { id: input },
      });
    }),

  /**
   * Get a user by their PRN.
   */
  getByPRN: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return ctx.db.user.findFirst({
        where: { prn: input },
      });
    }),

  /**
   * Get a user by their SRN.
   */
  getBySRN: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return ctx.db.user.findFirst({
        where: { srn: input },
      });
    }),

  /**
   * Update a user by their ID.
   */
  update: protectedProcedure
    .input(z.object({ id: z.string(), data: userZodedSchema }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.update({
        where: { id: input.id },
        data: input.data,
      });
    }),
});
