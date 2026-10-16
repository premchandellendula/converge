import { z } from "zod";

export const createJobSchema = z.object({
    companyId: z.number().int().positive(),
    title: z.string().min(3),
    description: z.string().min(20),
    location: z.string().min(2),
    jobType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"]),
    workMode: z.enum(["ONSITE", "HYBRID", "REMOTE"]),
    salaryMin: z.number().int().nonnegative().optional(),
    salaryMax: z.number().int().nonnegative().optional(),
});

export const updateJobSchema = createJobSchema
    .omit({ companyId: true })
    .partial()
    .extend({ status: z.enum(["OPEN", "CLOSED"]).optional() });

export const listJobsQuerySchema = z.object({
    q: z.string().trim().min(1).optional(),
    location: z.string().trim().min(1).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const jobIdParamSchema = z.object({
    id: z.coerce.number().int().positive(),
});

export type CreateJobDto = z.infer<typeof createJobSchema>;
export type UpdateJobDto = z.infer<typeof updateJobSchema>;
export type ListJobsQuery = z.infer<typeof listJobsQuerySchema>;