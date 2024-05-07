import { z } from "zod";

export const ZodStudent = z.object({
    prn: z.string(),
    srn: z.string(),
    name: z.string(),
    phone: z.string().optional(),
    email: z.string().optional(),
    program: z.string(),
    branch: z.string(),
    semester: z.string(),
    section: z.string(),
    campus: z.string(),
    cycle: z.string(),
});

export const ZodRegistration = z.object({
    eventID: z.string(),
    regType: z.enum(["SOLO", "TEAM"]),
    teamName: z.string().optional(),
    maxTeamMembers: z.number(),
    students: z.array(ZodStudent),
})

export const ZodEvent = {
    name: z.string(),
    creatorID: z.string(),
    date: z.string(),
    description: z.string(),
    type: z.enum(["hackathon", "seminar", "workshop", "performance", "screening", "CTF", "talk", "treasure-hunt"] as const),
    public: z.boolean(),
    participation: z.enum(["SOLO", "TEAM"]),
    maxTeamMembers: z.number(),
    registrations: z.array(ZodRegistration).optional(),
};