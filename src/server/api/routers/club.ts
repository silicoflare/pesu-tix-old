import { z } from "zod";

import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "~/server/api/trpc";

export const clubRouter = createTRPCRouter({
    hello: publicProcedure
        .input(z.object({ text: z.string() }))
        .query(({ input }) => {
            return {
                greeting: `Hello ${input.text}`,
            };
        }),

    getClub: publicProcedure
        .input(z.object({ username: z.string() }))
        .query(({ input, ctx }) => {
        return ctx.db.club.findFirst({
            where: { username: input.username },
        })
    }),
});

