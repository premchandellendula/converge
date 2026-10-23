import type { Prisma, PrismaClient, Resume } from "../../generated/prisma/client.js";
import { BaseDao } from "../../shared/dao/base.dao.js";

export class ResumeDao extends BaseDao<
    Resume,
    number,
    Prisma.ResumeUncheckedCreateInput,
    Prisma.ResumeUpdateInput,
    Prisma.ResumeWhereInput
> {
    constructor(private readonly prisma: PrismaClient) {
        super(prisma.resume, "resume");
    }

    readForApply(applicantId: number, resumeId?: number) {
        return this.prisma.resume.findFirst({
            where: { applicantId, ...(resumeId ? { id: resumeId } : {}) },
            orderBy: { uploadedAt: "desc" },
            select: { id: true, fileUrl: true },
        });
    }

    countForApplicant(applicantId: number) {
        return this.prisma.resume.count({ where: { applicantId } });
    }
}