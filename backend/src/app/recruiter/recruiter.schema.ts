import { z } from "zod";

const profileFields = z.object({
    designation: z.string().trim().min(2).max(100),
    department: z.string().trim().max(100).optional(),
    workEmail: z.email().optional(),
    linkedinUrl: z.url().optional(),
    bio: z.string().trim().max(1000).optional(),
});

const companyInput = z
    .object({
        name: z.string().trim().min(2).max(100),
        website: z.url().optional(),
        description: z.string().trim().max(2000).optional(),
        headquarters: z.string().trim().max(100).optional(),
    })
    .strict();

// Creating the profile also creates the company
export const createRecruiterSchema = profileFields.extend({ company: companyInput }).strict();

export const pagingSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
});

// Company edits belong in the company module (ADMIN only), so they are not accepted here
export const updateRecruiterSchema = profileFields.partial().strict();

export type CreateRecruiterDto = z.infer<typeof createRecruiterSchema>;
export type UpdateRecruiterDto = z.infer<typeof updateRecruiterSchema>;