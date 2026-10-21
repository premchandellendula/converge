import z from "zod";
import { JobStatus, JobType, WorkMode } from "../../generated/prisma/enums.js";
import { currencySchema } from "../../shared/lib.js";

const jobBase = z.object({
    title: z.string().trim().min(3).max(150),
    description: z.string().trim(),
    location: z.string().trim().min(2).max(100),
    jobType: z.enum(JobType),
    workMode: z.enum(WorkMode),
    experienceMin: z.number().int().min(0).max(50).optional(),
    experienceMax: z.number().int().min(0).max(50).optional(),
    salaryMin: z.number().int().nonnegative().optional(),
    salaryMax: z.number().int().nonnegative().optional(),
    currency: currencySchema.optional(),
    openings: z.number().int().min(1).max(1000).optional(),
    expiresAt: z.iso
        .datetime()
        .transform((s) => new Date(s))
        .refine((d) => d > new Date(), { message: "expiresAt must be in the future"})
        .optional(),
    skills: z.array(z.string().trim().min(1).max(50)).max(30).optional()
})

type RangeFields = {
    salaryMin?: number | undefined;
    salaryMax?: number | undefined;
    experienceMin?: number | undefined;
    experienceMax?: number | undefined;
};

const rangesValid = (d: RangeFields) =>
    (d.salaryMin === undefined || d.salaryMax === undefined || d.salaryMin <= d.salaryMax) &&
    (d.experienceMin === undefined || d.experienceMax === undefined || d.experienceMin <= d.experienceMax);

const rangesMessage = { message: "min must not be greater than max for salary and experience" };

export const createJobSchema = jobBase.strict().refine(rangesValid, rangesMessage);

export const updateJobSchema = jobBase
    .partial()
    .extend({ status: z.enum(JobStatus).optional() })
    .strict()
    .refine(rangesValid, rangesMessage);
    
// "FULL_TIME,CONTRACT" -> ["FULL_TIME", "CONTRACT"], then each item is validated
const csv = <T extends z.ZodType>(item: T) =>
    z.preprocess(
        (v) =>
        typeof v === "string"
            ? v.split(",").map((x) => x.trim()).filter(Boolean)
            : v,
        z.array(item),
    );

export const jobFiltersSchema = z.object({
    q: z.string().trim().min(1).max(100).optional(),
    jobType: csv(z.enum(JobType)).optional(),
    workMode: csv(z.enum(WorkMode)).optional(),
    location: csv(z.string().min(1).max(100)).optional(),
    expMin: z.coerce.number().int().min(0).max(60).optional(),
    expMax: z.coerce.number().int().min(0).max(60).optional(),
    salaryMin: z.coerce.number().int().nonnegative().optional(),
    salaryMax: z.coerce.number().int().nonnegative().optional(),
    postedWithin: z.coerce.number().int().min(1).max(365).optional(),
});

export const listJobsQuerySchema = jobFiltersSchema.extend({
    sort: z.enum(["recent", "popular"]).default("recent"),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
});
export const jobIdParamSchema = z.object({
    id: z.coerce.number().int().positive(),
});

export type CreateJobDto = z.infer<typeof createJobSchema>;
export type UpdateJobDto = z.infer<typeof updateJobSchema>;
export type JobFilters = z.infer<typeof jobFiltersSchema>;
export type ListJobsQuery = z.infer<typeof listJobsQuerySchema>;