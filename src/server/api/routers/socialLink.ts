import { z } from 'zod';
import { ZodSocialLink } from '~/schema.zod';
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '~/server/api/trpc';

const socialModify = z.object({
  linkID: z.string(),
  clubID: z.string(),
  data: z.object({
    type: z.string().optional(),
    label: z.string().optional(),
    link: z.string().optional(),
  }),
});

export const linkRouter = createTRPCRouter({
  hello: publicProcedure.input(z.string()).query(async ({ input, ctx }) => {
    return {
      greeting: `Hello, ${input}!`,
    };
  }),

  add: protectedProcedure
    .input(ZodSocialLink)
    .mutation(async ({ input, ctx }) => {
      return ctx.db.socialLink.create({
        data: input,
      });
    }),

  modify: protectedProcedure
    .input(socialModify)
    .mutation(async ({ input, ctx }) => {
      return ctx.db.socialLink.update({
        where: {
          linkID: input.linkID,
        },
        data: input.data,
      });
    }),

  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      return ctx.db.socialLink.delete({
        where: {
          linkID: input,
        },
      });
    }),
});
