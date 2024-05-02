import { z } from "zod";

import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "~/server/api/trpc";

const Event = {
    name: z.string(),
    creatorID: z.string(),
    date: z.string(),
    description: z.string(),
    type: z.enum(["hackathon", "seminar", "workshop", "performance", "screening", "CTF", "talk", "treasure-hunt"] as const),
}

const EditEventInput = z.object({
    id: z.string(),
    event: z.object({
        name: z.string(),
        description: z.string(),
        type: z.string(),
        date: z.string(),
    }),
});

type EditEventInput = z.infer<typeof EditEventInput>;

export const eventRouter = createTRPCRouter({
    hello: publicProcedure
        .input(z.object({ text: z.string() }))
        .query(({ input }) => {
            return {
                greeting: `Hello ${input.text}`,
            };
        }),

    getAllEvents: publicProcedure
        .input(z.object({ username: z.string().optional() }))
        .query(({ input, ctx }) => {
            if (!input.username) {
                return ctx.db.event.findMany()
            }
            return ctx.db.event.findMany({
                where: { creatorID: input.username },
            })
        }),

    getEvent: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(({ ctx, input }) => {
            return ctx.db.event.findUnique({
                where: { id: input.id },
            })
        }),

    createEvent: protectedProcedure
        .input(z.object({ event: z.object(Event) }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.event.create({
                data: {
                    name: input.event.name,
                    createdBy: { connect: { username: input.event.creatorID } },
                    description: input.event.description,
                    type: input.event.type,
                    date: input.event.date
                },
            })
        }),

    editEvent: protectedProcedure
        .input(EditEventInput)
        .mutation(async ({ ctx, input }) => {
            const { id, event } = input;
            return ctx.db.event.update({
                where: { id },
                data: {
                    name: event.name,
                    description: event.description,
                    type: event.type,
                    date: event.date,
                },
            });
        }),
})