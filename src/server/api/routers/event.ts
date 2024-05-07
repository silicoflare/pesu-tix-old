import { boolean, z } from "zod";

import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "~/server/api/trpc";

import { ZodEvent, ZodStudent } from "~/schema.zod";

const EditEventInput = z.object({
    id: z.string(),
    event: z.object({
        name: z.string(),
        description: z.string(),
        type: z.string(),
        date: z.string(),
        public: z.boolean(),
        participation: z.string(),
        maxTeamMembers: z.number(),
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
            if (input.username) {
                return ctx.db.event.findMany({
                    where: { creatorID: input.username, },
                    include: { registrations: true }
                });
            }
            else {
                return ctx.db.event.findMany({ where: { public: true }, include: { registrations: true } });
            }

        }),

    getEvent: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(({ ctx, input }) => {
            return ctx.db.event.findUnique({
                where: { id: input.id },
                include: { registrations: {
                    include: { students: true }
                } }
            })
        }),

    createEvent: protectedProcedure
        .input(z.object({ event: z.object(ZodEvent) }))
        .mutation(async ({ ctx, input }) => {
            const event = await ctx.db.event.create({
                data: {
                    name: input.event.name,
                    createdBy: { connect: { username: input.event.creatorID } },
                    description: input.event.description,
                    type: input.event.type,
                    date: input.event.date,
                    public: input.event.public,
                    participation: input.event.participation,
                    maxTeamMembers: 1
                },
                select: { id: true }
            });
            return { id: event.id };
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
                    public: event.public
                },
            });
        }),

    deleteEvent: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(({ ctx, input }) => {
            return ctx.db.event.delete({
                where: { id: input.id },
            });
        }),

    addRegistration: protectedProcedure
        .input(z.object({ id: z.string(), prn: z.string(), teamID: z.string().optional(), teamName: z.string().optional() }))
        .mutation(async ({ ctx, input }) => {
            if (input.teamID) {
                // team exists
                const maxMembers = await ctx.db.registration.findFirst({
                    where: { id: input.teamID },
                    include: { students: true }
                });
                if (maxMembers!.maxTeamMembers < maxMembers!.students.length) {
                    // team is not full
                    await ctx.db.registration.update({
                        where: { id: input.teamID },
                        data: {
                            students: {
                                connect: {
                                    prn: input.prn
                                }
                            }
                        }
                    });
                }
                else {
                    // team is full
                    throw new Error("Team is full");
                }
            }
            else {
                // team does not exist
                const event = await ctx.db.event.findUnique({
                    where: { id: input.id },
                });
                await ctx.db.registration.create({
                    data: {
                        event: { connect: { id: input.id } },
                        students: {
                            connect: {
                                prn: input.prn
                            }
                        },
                        teamName: input.teamName,
                        maxTeamMembers: event!.maxTeamMembers,
                        regType: event!.participation,
                    }
                });
            }
        }),

    removeRegistration: protectedProcedure
        .input(z.object({ id: z.string(), prn: z.string(), regID: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const registration = await ctx.db.registration.findFirst({
                where: { id: input.regID },
                include: { students: true }
            });
            if (registration!.regType === "TEAM") {
                // team participation
                if (registration!.students.length > 1) {
                    // more than 1 student in team
                    await ctx.db.registration.update({
                        where: { id: input.regID },
                        data: {
                            students: {
                                disconnect: {
                                    prn: input.prn
                                }
                            }
                        }
                    });
                }
                else {
                    // only 1 student in team
                    await ctx.db.registration.delete({
                        where: { id: input.regID },
                    });
                }
            }
            else {
                // solo participation
                await ctx.db.registration.delete({
                    where: { id: input.regID },
                });
            }
        }),



    checkRegistration: protectedProcedure
        .input(z.object({ id: z.string(), prn: z.string() }))
        .query(({ ctx, input }) => {
            return ctx.db.registration.findFirst({
                where: {
                    eventId: input.id,
                    students: {
                        some: {
                            prn: input.prn,
                        },
                    },
                },
            });
        }),
})