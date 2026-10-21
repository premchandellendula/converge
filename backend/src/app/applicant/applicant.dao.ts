import type { ApplicantDetails, Prisma, PrismaClient } from "../../generated/prisma/client.js";
import { BaseDao } from "../../shared/dao/base.dao.js";

export const applicantSelect = {
    id: true,
    summary: true,
    location: true,
    linkedinUrl: true,
    githubUrl: true,
    industry: true,
    totalExpInYears: true,
    remainingExpMonths: true,
    currentSalary: true,
    expectedSalary: true,
    currency: true,
    noticePeriodDays: true,
    openToWork: true,
    willingToRelocate: true,
    preferredLocations: true,
    skills: { select: { name: true } },
    educations: {
        select: {
            id: true, level: true, institution: true, boardOrUniversity: true, course: true,
            specialization: true, startYear: true, endYear: true, score: true, scoreType: true,
        },
    },
} satisfies Prisma.ApplicantDetailsSelect;

export type ApplicantResponse = Prisma.ApplicantDetailsGetPayload<{ select: typeof applicantSelect }>;

export class ApplicantDao extends BaseDao<
    ApplicantDetails,
    number,
    Prisma.ApplicantDetailsCreateInput,
    Prisma.ApplicantDetailsUpdateInput,
    Prisma.ApplicantDetailsWhereInput
> {
    constructor(private readonly prisma: PrismaClient) {
        super(prisma.applicantDetails, "applicant");
    }

    readByUserId(userId: string) {
        return this.prisma.applicantDetails.findUnique({ where: { userId }, select: applicantSelect });
    }

    readIdByUserId(userId: string) {
        return this.prisma.applicantDetails.findUnique({ where: { userId }, select: { id: true } });
    }
}