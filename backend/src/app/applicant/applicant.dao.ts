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
    user: { select: { firstName: true, lastName: true, email: true, phone: true, avatarUrl: true } },
    skills: { select: { name: true }, orderBy: { name: "asc" } },
    educations: {
        select: { id: true, level: true, institution: true, course: true, startYear: true, endYear: true, score: true, scoreType: true },
        orderBy: [{ endYear: "desc" }, { id: "desc" }],
    },
    workExperiences: {
        select: { id: true, title: true, companyName: true, location: true, startDate: true, endDate: true, isCurrent: true, description: true },
        orderBy: [{ isCurrent: "desc" }, { startDate: "desc" }],
    },
    resumes: { select: { id: true, fileName: true, uploadedAt: true }, orderBy: { uploadedAt: "desc" } },
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

    readResumeFor(applicantId: number, resumeId?: number) {
        return this.prisma.resume.findFirst({
            where: { applicantId, ...(resumeId ? { id: resumeId } : {}) },
            orderBy: { uploadedAt: "desc" },
            select: { id: true, fileUrl: true },
        });
    }
    
    readApplicationForJob(jobId: number, applicantId: number) {
        return this.prisma.application.findUnique({
            where: { jobId_applicantId: { jobId, applicantId } },
            select: { id: true, status: true },
        });
    }
    
    createApplication(data: Prisma.ApplicationUncheckedCreateInput) {
        return this.prisma.application.create({ data, select: { id: true } });
    }
    
    updateApplication(id: number, data: Prisma.ApplicationUncheckedUpdateInput) {
        return this.prisma.application.update({ where: { id }, data, select: { id: true } });
    }

    readOwnApplication(applicationId: number, applicantId: number) {
        return this.prisma.application.findFirst({
            where: { id: applicationId, applicantId },
            select: { id: true, status: true },
        });
    }
}