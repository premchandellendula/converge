import type { Job, Prisma, PrismaClient } from "../../generated/prisma/client.js";
import { BaseDao } from "../../shared/dao/base.dao.js";
import { buildWhere, daysAgo, EXPERIENCE_BUCKETS, overlapExperience, overlapSalary, POSTED_WITHIN, SALARY_BUCKETS, toRupees, type FilterKey } from "./job.filters.js";
import type { JobFilters, ListJobsQuery } from "./job.schema.js";

// Whitelist of columns that may leave the API. New columns stay hidden until added here.
export const jobListSelect = {
    id: true,
    title: true,
    location: true,
    jobType: true,
    workMode: true,
    experienceMin: true,
    experienceMax: true,
    salaryMin: true,
    salaryMax: true,
    currency: true,
    createdAt: true,
    company: { select: { id: true, name: true, slug: true, logoUrl: true } },
    skills: { select: { name: true } },
} satisfies Prisma.JobSelect;

export type JobListItem = Prisma.JobGetPayload<{ select: typeof jobListSelect }>;

export interface FacetOption { value: string; count: number }
export interface JobFacets {
    jobType: FacetOption[];
    workMode: FacetOption[];
    location: FacetOption[];
    experience: FacetOption[];
    salary: FacetOption[];
    postedWithin: FacetOption[];
}

export const jobPostingSelect = {
    ...jobListSelect,
    status: true,
    openings: true,
    expiresAt: true,
    updatedAt: true,
    _count: { select: { applications: true } },
} satisfies Prisma.JobSelect;

export type JobPostingItem = Prisma.JobGetPayload<{ select: typeof jobPostingSelect }>;

const orderByMap: Record<ListJobsQuery["sort"], Prisma.JobOrderByWithRelationInput[]> = {
    recent: [{ createdAt: "desc" }, { id: "desc" }],
    popular: [{ applications: { _count: "desc" } }, { id: "desc" }],
};

export class JobDao extends BaseDao<
    Job,
    number,
    Prisma.JobUncheckedCreateInput,
    Prisma.JobUpdateInput,
    Prisma.JobWhereInput
> {
    constructor(private readonly prisma: PrismaClient) {
        super(prisma.job, "job");
    }

    // Translates the search query into a `where` and reuses readMany
    async search(q: ListJobsQuery) {
        const where = buildWhere(q);
        const [items, total] = await Promise.all([
            this.prisma.job.findMany({
                where,
                select: jobListSelect,
                orderBy: orderByMap[q.sort],
                skip: (q.page - 1) * q.limit,
                take: q.limit
            }),
            this.prisma.job.count({ where })
        ])

        return { items, total }
    }

    async facets(f: JobFilters): Promise<JobFacets> {
        const count = (omit: FilterKey, extra: Prisma.JobWhereInput[]) => this.prisma.job.count({ where: { AND: [buildWhere(f, omit), ...extra] } });

        const [jobType, workMode, location, experience, salary, postedWithin] = await Promise.all([
            this.prisma.job.groupBy({
                by: ["jobType"],
                where: buildWhere(f, "jobType"),
                _count: { _all: true }
            }),
            this.prisma.job.groupBy({
                by: ["workMode"],
                where: buildWhere(f, "workMode"),
                _count: { _all: true }
            }),
            this.prisma.job.groupBy({
                by: ["location"],
                where: buildWhere(f, "location"),
                _count: { _all: true },
                orderBy: { _count: { location: "desc" } },
                take: 30,
            }),
            Promise.all(
                EXPERIENCE_BUCKETS.map(async (b) => ({
                    value: b.key,
                    count: await count("experience", overlapExperience(b.min, b.max ?? undefined)),
                })),
            ),
            Promise.all(
                SALARY_BUCKETS.map(async (b) => ({
                    value: b.key,
                    count: await count(
                        "salary",
                        overlapSalary(toRupees(b.min), b.max === null ? undefined : toRupees(b.max)),
                    ),
                })),
            ),
            Promise.all(
                POSTED_WITHIN.map(async (days) => ({
                    value: String(days),
                    count: await count("postedWithin", [{ createdAt: { gte: daysAgo(days) } }]),
                })),
            ),
        ])

        return {
            jobType: jobType.map((r) => ({ value: r.jobType, count: r._count._all })),
            workMode: workMode.map((r) => ({ value: r.workMode, count: r._count._all })),
            location: location.map((r) => ({ value: r.location, count: r._count._all })),
            experience,
            salary,
            postedWithin,
        };
    }
}