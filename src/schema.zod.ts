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

export const ZodEvent = {
    name: z.string(),
    creatorID: z.string(),
    date: z.string(),
    description: z.string(),
    type: z.enum(["hackathon", "seminar", "workshop", "performance", "screening", "CTF", "talk", "treasure-hunt"] as const),
    public: z.boolean(),
    registrations: z.array(ZodStudent).optional(),
};