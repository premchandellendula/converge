import type { Prisma, PrismaClient, RecruiterDetails } from "../../generated/prisma/client.js";
import { BaseDao } from "../../shared/dao/base.dao.js";
import type { ListApplicationsQuery } from "../application/application.schema.js";

const LEVEL_RANK = ["TENTH", "TWELFTH", "DIPLOMA", "GRADUATION", "POST_GRADUATION", "DOCTORATE"];

const lower = (s: string) => s.toLowerCase();

// Whitelist of what may leave the API
export const recruiterSelect = {
    id: true,
    designation: true,
    department: true,
    companyRole: true,
    workEmail: true,
    linkedinUrl: true,
    bio: true,
    isVerified: true,
    joinedAt: true,
    company: { select: { id: true, name: true, slug: true, logoUrl: true, website: true } },
} satisfies Prisma.RecruiterDetailsSelect;

export type RecruiterResponse = Prisma.RecruiterDetailsGetPayload<{ select: typeof recruiterSelect }>;

export class RecruiterDao extends BaseDao<
    RecruiterDetails,
    number,
    Prisma.RecruiterDetailsCreateInput,
    Prisma.RecruiterDetailsUpdateInput,
    Prisma.RecruiterDetailsWhereInput
> {
    constructor(private readonly prisma: PrismaClient) {
        super(prisma.recruiterDetails, "recruiter");
    }

    readByUserId(userId: string) {
        return this.prisma.recruiterDetails.findUnique({ where: { userId }, select: recruiterSelect });
    }

    // The few facts other services need: who is this recruiter and which company are they in
    readContextByUserId(userId: string) {
        return this.prisma.recruiterDetails.findUnique({
            where: { userId },
            select: { id: true, companyId: true, companyRole: true },
        });
    }

    scopeByUserId(userId: string) {
        return this.prisma.recruiterDetails.findUnique({
            where: { userId },
            select: { id: true, companyId: true },
        });
    }

    jobOfCompany(jobId: number, companyId: number) {
        return this.prisma.job.findFirst({
            where: { id: jobId, companyId },
            select: { id: true, skills: { select: { name: true } } },
        });
    }

    async listApplications(jobId: number, jobSkills: { name: string }[], q: ListApplicationsQuery) {
        const where: Prisma.ApplicationWhereInput = {
            jobId,
            ...(q.status ? { status: q.status } : {}),
            ...(q.q
                ? {
                    applicant: {
                        OR: [
                            { user: { firstName: { contains: q.q, mode: "insensitive" } } },
                            { user: { lastName: { contains: q.q, mode: "insensitive" } } },
                            { skills: { some: { name: { contains: q.q, mode: "insensitive" } } } },
                        ],
                    },
                }
                : {}),
        };

        const [rows, total] = await Promise.all([
            this.prisma.application.findMany({
                where,
                orderBy: [{ createdAt: "desc" }, { id: "desc" }],
                skip: (q.page - 1) * q.limit,
                take: q.limit,
                select: {
                    id: true,
                    status: true,
                    createdAt: true,
                    resumeId: true,
                    resumeUrl: true,
                    applicant: {
                        select: {
                            location: true,
                            totalExpInYears: true,
                            remainingExpMonths: true,
                            expectedSalary: true,
                            currency: true,
                            noticePeriodDays: true,
                            user: { select: { firstName: true, lastName: true } },
                            skills: { select: { name: true } },
                            workExperiences: {
                                select: { title: true, companyName: true },
                                orderBy: [{ isCurrent: "desc" }, { startDate: "desc" }],
                                take: 1,
                            },
                            educations: { select: { level: true, institution: true } },
                        },
                    },
                },
            }),
            this.prisma.application.count({ where }),
        ]);

        const wanted = new Set(jobSkills.map((s) => lower(s.name)));

        const items = rows.map((r) => {
            const { skills, workExperiences, educations, ...applicant } = r.applicant;
            const highest = [...educations].sort((a, b) => LEVEL_RANK.indexOf(b.level) - LEVEL_RANK.indexOf(a.level))[0];
            return {
                id: r.id,
                status: r.status,
                createdAt: r.createdAt,
                hasResume: r.resumeId !== null || r.resumeUrl !== null,
                matchedSkills: skills.filter((s) => wanted.has(lower(s.name))).map((s) => s.name),
                requiredSkillCount: jobSkills.length,
                applicant: {
                    ...applicant,
                    currentRole: workExperiences[0] ?? null,
                    education: highest ?? null,
                },
            };
        });

        return { items, total };
    }

    async applicationCounts(jobId: number) {
        const rows = await this.prisma.application.groupBy({
            by: ["status"],
            where: { jobId },
            _count: { _all: true },
        });
        const out: Record<string, number> = {
            ALL: 0, APPLIED: 0, SHORTLISTED: 0, INTERVIEW: 0, HIRED: 0, REJECTED: 0, WITHDRAWN: 0,
        };
        for (const r of rows) {
            out[r.status] = r._count._all;
            out.ALL += r._count._all;
        }
        return out;
    }

    async applicationDetail(applicationId: number, companyId: number) {
        const a = await this.prisma.application.findFirst({
            where: { id: applicationId, job: { companyId } },
            select: {
                id: true,
                status: true,
                createdAt: true,
                updatedAt: true,
                coverLetter: true,
                resumeId: true,
                resumeUrl: true,
                job: {
                    select: {
                        id: true, title: true, salaryMin: true, salaryMax: true, currency: true,
                        skills: { select: { name: true } },
                    },
                },
                applicant: {
                    select: {
                        summary: true, location: true, linkedinUrl: true, githubUrl: true,
                        totalExpInYears: true, remainingExpMonths: true,
                        expectedSalary: true, currency: true, noticePeriodDays: true,
                        willingToRelocate: true, preferredLocations: true,
                        // no currentSalary and no file urls on purpose
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
                    },
                },
            },
        });
        if (!a) return null;

        const wanted = new Set(a.job.skills.map((s) => lower(s.name)));
        const { resumeId, resumeUrl, job, ...rest } = a;
        return {
            ...rest,
            hasResume: resumeId !== null || resumeUrl !== null,
            matchedSkills: a.applicant.skills.filter((s) => wanted.has(lower(s.name))).map((s) => s.name),
            requiredSkillCount: job.skills.length,
            job: { id: job.id, title: job.title, salaryMin: job.salaryMin, salaryMax: job.salaryMax, currency: job.currency },
        };
    }

    /** Ownership check for status changes and the resume link. */
    findForCompany(applicationId: number, companyId: number) {
        return this.prisma.application.findFirst({
            where: { id: applicationId, job: { companyId } },
            select: { id: true, status: true, resumeUrl: true },
        });
    }

    setStatus(applicationId: number, status: "APPLIED" | "SHORTLISTED" | "INTERVIEW" | "REJECTED" | "HIRED") {
        return this.prisma.application.update({ where: { id: applicationId }, data: { status }, select: { id: true } });
    }
}