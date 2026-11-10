import z from "zod";
import { pagingSchema } from "../recruiter/recruiter.schema.js";

export const updateApplicationStatusSchema = z
    .object({ status: z.enum(["SHORTLISTED", "INTERVIEW", "REJECTED", "HIRED"]) })
    .strict();

export const listApplicationsQuerySchema = pagingSchema.extend({
    status: z.enum(["APPLIED", "SHORTLISTED", "INTERVIEW", "REJECTED", "HIRED", "WITHDRAWN"]).optional(),
    q: z.string().trim().min(1).max(100).optional(),          // name or skill
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const postingParamSchema = z.object({
    jobId: z.coerce.number().int().positive(),
});

export const applicationIdParamSchema = z.object({ id: z.coerce.number().int().positive() });
export const jobIdParamSchema = z.object({ jobId: z.coerce.number().int().positive() });

export type ListApplicationsQuery = z.infer<typeof listApplicationsQuerySchema>;