import z from "zod";
import { pagingSchema } from "../recruiter/recruiter.schema.js";
import { CompanySize } from "../../generated/prisma/enums.js";

const httpUrl = z.url({ protocol: /^https?^/});

export const companyIdParamSchema = z.object({
    id: z.coerce.number().int().positive()
})

export const companyJobsQuerySchema = pagingSchema;

export const updateCompanySchema = z
    .object({
        name: z.string().trim().min(2).max(100),
        website: httpUrl.nullable(),
        logoUrl: httpUrl.nullable(),
        description: z.string().trim().max(2000).nullable(),
        industry: z.string().trim().max(100).nullable(),
        size: z.enum(CompanySize).nullable(),
        foundedYear: z.number().int().min(1800).max(new Date().getFullYear()).nullable(),
        headquarters: z.string().trim().max(100).nullable(),
    })
    .partial()
    .strict()
    .refine((body) => Object.keys(body).length > 0, { message: "No fields to update" });

export type UpdateCompanyDto = z.infer<typeof updateCompanySchema>;