import type { Job, Prisma, PrismaClient } from "../../generated/prisma/client.js";
import { BaseDao } from "../../shared/dao/base.dao.js";
import type { ListJobsQuery } from "./job.schema.js";

// Whitelist of columns that may leave the API. New columns stay hidden until added here.
export const jobSelect = {
    id: true,
    title: true,
    description: true,
    location: true,
    jobType: true,
    workMode: true,
    salaryMin: true,
    salaryMax: true,
    currency: true,
    status: true,
    createdAt: true,
} satisfies Prisma.JobSelect;

export type JobResponse = Prisma.JobGetPayload<{ select: typeof jobSelect }>;

export class JobDao extends BaseDao<
    Job,
    number, // use `number` if Job.id is an Int
    Prisma.JobUncheckedCreateInput,
    Prisma.JobUpdateInput,
    Prisma.JobWhereInput
> {
    constructor(prisma: PrismaClient) {
        super(prisma.job, "job");
    }

  // Translates the search query into a `where` and reuses readMany
    search(q: ListJobsQuery) {
        const where: Prisma.JobWhereInput = { status: "OPEN" };
        if (q.q) where.title = { contains: q.q, mode: "insensitive" };
        if (q.location) where.location = { contains: q.location, mode: "insensitive" };

        return this.readMany<JobResponse>({
            where,
            select: jobSelect,
            page: q.page,
            count: q.limit,
        });
    }
}