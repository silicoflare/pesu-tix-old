import { z } from "zod";

import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "~/server/api/trpc";

import { ZodStudent } from "~/schema.zod";

export const studentRouter = createTRPCRouter({
    findStudent: publicProcedure
        .input(z.object({ prn: z.string() }))
        .query(async ({ ctx, input }) => {
            return ctx.db.student.findFirst({
                where: { prn: input.prn },
            });
        }),

    addStudent: publicProcedure
        .input(z.object({ student: ZodStudent }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.student.create({ data: input.student });
        })

})