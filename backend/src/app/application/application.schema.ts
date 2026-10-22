import z from "zod";
import { pagingSchema } from "../recruiter/recruiter.schema.js";

export const updateApplicationStatusSchema = z
    .object({ status: z.enum(["SHORTLISTED", "INTERVIEW", "REJECTED", "HIRED"]) })
    .strict();

export const listApplicationsQuerySchema = pagingSchema.extend({
    status: z.enum(["APPLIED", "SHORTLISTED", "INTERVIEW", "REJECTED", "HIRED", "WITHDRAWN"]).optional(),
});

export const applicationIdParamSchema = z.object({ id: z.coerce.number().int().positive() });
export const jobIdParamSchema = z.object({ jobId: z.coerce.number().int().positive() });