import type { Application, Prisma, PrismaClient } from "../../generated/prisma/client.js";
import { BaseDao } from "../../shared/dao/base.dao.js";

export const applicationListSelect = {
    id: true,
    status: true,
    coverLetter: true,
    createdAt: true,
    job: {
        select: {
        id: true, title: true, location: true, status: true,
        company: { select: { name: true, logoUrl: true } },
        },
    },
} satisfies Prisma.ApplicationSelect;

export const applicationForRecruiterSelect = {
    id: true,
    status: true,
    coverLetter: true,
    resumeUrl: true,
    createdAt: true,
    applicant: {
        select: {
            id: true,
            location: true,
            totalExpInYears: true,
            remainingExpMonths: true,
            expectedSalary: true,
            currency: true,
            noticePeriodDays: true,
            skills: { select: { name: true } },
            user: { select: { firstName: true, lastName: true, email: true, phone: true } },
        },
    },
} satisfies Prisma.ApplicationSelect;

export type ApplicationForRecruiter = Prisma.ApplicationGetPayload<{ select: typeof applicationForRecruiterSelect }>;

export type ApplicationListItem = Prisma.ApplicationGetPayload<{ select: typeof applicationListSelect }>;

export class ApplicationDao extends BaseDao<
    Application,
    number,
    Prisma.ApplicationUncheckedCreateInput,
    Prisma.ApplicationUpdateInput,
    Prisma.ApplicationWhereInput
> {
    constructor(private readonly prisma: PrismaClient) {
        super(prisma.application, "application");
    }

    readByJobAndApplicant(jobId: number, applicantId: number) {
        return this.prisma.application.findUnique({
            where: { jobId_applicantId: { jobId, applicantId } },
            select: { id: true },
        });
    }
}