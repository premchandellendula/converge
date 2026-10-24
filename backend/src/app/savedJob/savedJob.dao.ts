import type { Prisma, PrismaClient } from "../../generated/prisma/client.js";
import { jobListSelect } from "../job/job.dao.js";

export const savedJobSelect = {
    savedAt: true,
    job: { select: { ...jobListSelect, status: true, expiresAt: true } },
} satisfies Prisma.SavedJobSelect;

export type SavedJobItem = Prisma.SavedJobGetPayload<{ select: typeof savedJobSelect }>;

export class SavedJobDao {
    constructor(private readonly prisma: PrismaClient) {}

    async list(applicantId: number, page: number, limit: number) {
        const where = { applicantId };
        const [items, total] = await Promise.all([
            this.prisma.savedJob.findMany({
                where, select: savedJobSelect, orderBy: { savedAt: "desc" },
                skip: (page - 1) * limit, take: limit,
            }),
            this.prisma.savedJob.count({ where }),
        ]);
        return { items, total };
    }

    save(applicantId: number, jobId: number) {
        return this.prisma.savedJob.upsert({
            where: { applicantId_jobId: { applicantId, jobId } },
            create: { applicantId, jobId },
            update: {},
            select: { jobId: true },
        });
    }

    async remove(applicantId: number, jobId: number) {
        const { count } = await this.prisma.savedJob.deleteMany({ where: { applicantId, jobId } });
        return count;
    }
}