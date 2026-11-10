import { z } from "zod";
import { currencySchema } from "../../shared/lib.js";
import { ApplicationStatus, Currency } from "../../generated/prisma/enums.js";

const educationSchema = z
    .object({
        level: z.enum(["TENTH", "TWELFTH", "DIPLOMA", "GRADUATION", "POST_GRADUATION", "DOCTORATE"]),
        institution: z.string().trim().min(1).max(150),
        boardOrUniversity: z.string().trim().max(150).optional(),
        course: z.string().trim().max(100).optional(),
        specialization: z.string().trim().max(100).optional(),
        startYear: z.number().int().min(1950).max(2100).optional(),
        endYear: z.number().int().min(1950).max(2100).optional(),
        score: z.number().min(0).max(100).optional(),
        scoreType: z.enum(["PERCENTAGE", "CGPA"]).optional(),
    })
    .refine((e) => !e.startYear || !e.endYear || e.endYear >= e.startYear, {
        message: "endYear must not be before startYear",
        path: ["endYear"],
    })
    .refine((e) => e.score === undefined || e.scoreType !== undefined, {
        message: "scoreType is required when score is given",
        path: ["scoreType"],
    })
    .refine((e) => e.scoreType !== "CGPA" || e.score === undefined || e.score <= 10, {
        message: "CGPA cannot be more than 10",
        path: ["score"],
    });

const workExperienceSchema = z
    .object({
        title: z.string().trim().min(1).max(100),
        companyName: z.string().trim().min(1).max(100),
        location: z.string().trim().max(100).optional(),
        startDate: z.coerce.date(),
        endDate: z.coerce.date(),
        isCurrent: z.boolean().default(false),
        description: z.string().trim().max(1000).optional()
    })  
    .refine((x) => x.isCurrent || x.endDate !== undefined, {
        message: "endDate is required unless this is current job",
        path: ["endDate"],
    })
    .refine((x) => !x.endDate || x.endDate >= x.startDate, {
        message: "endDate must not be before startDate",
        path: ["endDate"]
    })
    .refine((x) => x.startDate <= new Date(), {
        message: "startDate cannot be in the future",
        path: ["startDate"]
    })

const profileBase = z.object({
    summary: z.string().trim().max(2000).optional(),
    location: z.string().trim().max(100).optional(),
    linkedinUrl: z.url().optional(),
    githubUrl: z.url().optional(),
    industry: z.string().trim().max(100).optional(),
    totalExpInYears: z.number().int().min(0).max(60),
    remainingExpMonths: z.number().int().min(0).max(11),
    currentSalary: z.number().int().nonnegative().optional(),
    expectedSalary: z.number().int().nonnegative().optional(),
    currency: z.enum(Currency),
    noticePeriodDays: z.number().int().min(0).max(365).optional(),
    openToWork: z.boolean().optional(),
    willingToRelocate: z.boolean().optional(),
    preferredLocations: z.array(z.string().trim().min(1)).max(10).optional(),
    skills: z.array(z.string().trim().min(1).max(50)).max(50).optional(),
    educations: z.array(educationSchema).max(10).optional(),
    workExperiences: z.array(workExperienceSchema).max(10).optional()
});

export const applyToJobSchema = z
    .object({
        resumeId: z.number().int().positive().optional(),
        coverLetter: z.string().trim().max(3000).optional(),
    })
    .strict();

export const jobParamSchema = z.object({
    id: z.coerce.number().int().positive()
})

export const applicationIdParamSchema = z.object({
    id: z.coerce.number().int().positive()
})
export const postingParamSchema = z.object({
    jobId: z.coerce.number().int().positive(),
});

export const listApplicationsQuerySchema = z.object({
    status: z.enum(ApplicationStatus).optional(),
    q: z.string().trim().min(1).max(100).optional(),          // name or skill
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
});

// A recruiter can never set WITHDRAWN (only the candidate can withdraw).
export const updateApplicationStatusSchema = z
    .object({
        status: z.enum(["APPLIED", "SHORTLISTED", "INTERVIEW", "REJECTED", "HIRED"]),
    })
    .strict();

export type ListApplicationsQuery = z.infer<typeof listApplicationsQuerySchema>;
export const resumeIdParamSchema = z.object({ id: z.coerce.number().int().positive() });
export const savedJobParamSchema = z.object({ id: z.coerce.number().int().positive() });

export type ApplyToJobDto = z.infer<typeof applyToJobSchema>;
export const createApplicantSchema = profileBase.strict();
export const updateApplicantSchema = profileBase.partial().strict();

export type EducationInput = z.infer<typeof educationSchema>;
export type WorkExperienceInput = z.infer<typeof workExperienceSchema>;
export type CreateApplicantDto = z.infer<typeof createApplicantSchema>;
export type UpdateApplicantDto = z.infer<typeof updateApplicantSchema>;