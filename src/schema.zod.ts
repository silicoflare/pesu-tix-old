import { z } from 'zod';
import { JsonValue } from '@prisma/client/runtime/library';

export const ZodJSON = z
  .union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(z.any()),
    z.object({}).passthrough(),
  ])
  .optional();

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
  regType: z.enum(['SOLO', 'TEAM']),
  teamName: z.string().optional(),
  maxTeamMembers: z.number(),
  students: z.array(ZodStudent),
});

export const ZodEvent = {
  name: z.string(),
  creatorID: z.string(),
  date: z.string(),
  description: z.string(),
  imageURL: z.string(),
  type: z.string(),
  public: z.boolean(),
  extraQuestions: ZodJSON,
  participation: z.enum(['SOLO', 'TEAM']),
  maxTeamMembers: z.number(),
  registrations: z.array(ZodRegistration).optional(),
  password: z.string(),
};

export const ZodClub = z.object({
  username: z.string(),
  name: z.string(),
  password: z.string().optional(),
  campus: z.string(),
  avatar: z.string(),
  links: ZodJSON,
});
