import { z } from "zod";

import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "~/server/api/trpc";

export const adminRouter = createTRPCRouter({
    getAdmin: publicProcedure
        .input(z.object({ username: z.string() }))
        .query(({ input, ctx }) => {
        return ctx.db.admin.findFirst({
            where: { username: input.username },
        })
    }),
});

