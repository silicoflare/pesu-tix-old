import { z } from 'zod';
import { ZodClub } from '~/schema.zod';

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '~/server/api/trpc';
import { nhost } from '~/tools';
import { api, server_api } from '~/utils/api';

export const clubRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  sample: publicProcedure.input(z.string()).query(({ input }) => {
    return {
      text: input,
    };
  }),

  list: publicProcedure.query(({ ctx }) => {
    return ctx.db.club.findMany();
  }),

  create: protectedProcedure.input(ZodClub).mutation(async ({ ctx, input }) => {
    return ctx.db.club.create({
      data: {
        name: input.name,
        username: input.username,
        campus: input.campus as 'RR' | 'EC',
        password: input.password ?? '',
        avatar: input.avatar,
      },
    });
  }),

  get: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(({ input, ctx }) => {
      return ctx.db.club.findFirst({
        where: { username: input.username },
      });
    }),

  resetPassword: protectedProcedure
    .input(z.object({ username: z.string(), password: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.club.update({
        where: {
          username: input.username,
        },
        data: {
          password: input.password,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ username: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const club = await ctx.db.club.findFirst({
        where: { username: input.username },
      });

      if (!club) {
        return { message: 'Club not found' };
      }

      // Delete all club events
      const events = await ctx.db.event.findMany({
        where: {
          creatorID: input.username,
        },
      });

      for (let x of events) {
        await nhost.storage.delete({ fileId: x.imageURL });
        await ctx.db.event.delete({
          where: {
            id: x.id,
          },
        });
      }

      // Delete the club
      await nhost.storage.delete({ fileId: club?.avatar });
      await ctx.db.club.delete({
        where: {
          username: input.username,
        },
      });

      return { message: 'Club deleted successfully' };
    }),

  changeName: protectedProcedure
    .input(z.object({ username: z.string(), newName: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const club = await ctx.db.club.findFirst({
        where: { username: input.username },
      });

      if (!club) {
        return { message: 'Club not found' };
      }

      await ctx.db.club.update({
        where: { username: input.username },
        data: { name: input.newName },
      });

      return { message: 'Name changed successfully' };
    }),
});
