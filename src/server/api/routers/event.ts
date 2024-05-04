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
        public: z.boolean()
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
                    public: false
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

    // toggleRegistration: protectedProcedure
    //     .input(z.object({ id: z.string(), student: z.object(ZodStudent) }))
    //     .mutation(async ({ ctx, input }) => {
    //         const { id, student } = input;

    //         // Check if the student is already registered for the event
    //         const existingRegistration = await ctx.db.event.findFirst({
    //             where: {
    //                 id,
    //                 registrations: {
    //                     some: {
    //                         prn: student.prn,
    //                     },
    //                 },
    //             },
    //         });

    //         if (existingRegistration) {
    //             // Remove the existing registration
    //             await ctx.db.event.update({
    //                 where: { id },
    //                 data: {
    //                     registrations: {
    //                         delete: {
    //                             prn: student.prn,
    //                         },
    //                     },
    //                 },
    //             });
    //             return {};
    //         }

    //         const newRegistration = await ctx.db.event.update({
    //             where: { id },
    //             data: {
    //                 registrations: {
    //                     create: {
    //                         prn: student.prn,
    //                         srn: student.srn,
    //                         name: student.name,
    //                         phone: student.phone,
    //                         email: student.email,
    //                         program: student.program,
    //                         branch_short_code: student.branch_short_code,
    //                         branch: student.branch,
    //                         semester: student.semester,
    //                         section: student.section,
    //                         campus_code: student.campus_code,
    //                         campus: student.campus,
    //                         class: student.class,
    //                         cycle: student.cycle,
    //                         department: student.department,
    //                         institute_name: student.institute_name,
    //                     },
    //                 },
    //             },
    //         });
    //         return newRegistration;
    //     }),

    // toggleRegistration: protectedProcedure
    //     .input(z.object({ id: z.string(), prn: z.string() }))
    //     .mutation(async ({ ctx, input }) => {
    //         // Check if the student is already registered for the event
    //         const event = await ctx.db.event.findFirst({
    //             where: {
    //                 id: input.id,
    //             },
    //             include: {
    //                 registrations: {
    //                     where: {
    //                         prn: input.prn,
    //                     },
    //                 },
    //             },
    //         });

    //         if (event?.registrations) {
    //             // Remove the registration from the event
    //             await ctx.db.event.update({
    //                 where: {
    //                     id: input.id,
    //                 },
    //                 data: {
    //                     registrations: {
    //                         disconnect: {
    //                             prn: input.prn,
    //                         },
    //                     },
    //                 },
    //             });
    //             return {};
    //         }

    //         // Add the registration to the event
    //         await ctx.db.event.update({
    //             where: {
    //                 id: input.id,
    //             },
    //             data: {
    //                 registrations: {
    //                     connect: {
    //                         prn: input.prn,
    //                     }
    //                 },
    //             },
    //         });
    //         return {};
    //     }),

    addRegistration: protectedProcedure
        .input(z.object({ id: z.string(), prn: z.string() }))
        .mutation(({ ctx, input }) => {
            return ctx.db.event.update({
                where: { id: input.id },
                data: {
                    registrations: {
                        connect: {
                            prn: input.prn,
                        }
                    },
                },
            });
        }),

    removeRegistration: protectedProcedure
        .input(z.object({ id: z.string(), prn: z.string() }))
        .mutation(({ ctx, input }) => {
            return ctx.db.event.update({
                where: { id: input.id },
                data: {
                    registrations: {
                        disconnect: {
                            prn: input.prn,
                        }
                    },
                },
            });
        }),


    checkRegistration: protectedProcedure
        .input(z.object({ id: z.string(), prn: z.string() }))
        .query(({ ctx, input }) => {
            return ctx.db.event.findFirst({
                where: {
                    id: input.id,
                    registrations: {
                        some: {
                            prn: input.prn,
                        },
                    },
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
})