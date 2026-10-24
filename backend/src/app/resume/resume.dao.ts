import type { Prisma, PrismaClient, Resume } from "../../generated/prisma/client.js";
import { BaseDao } from "../../shared/dao/base.dao.js";

export const resumeListSelect = { id: true, fileName: true, uploadedAt: true } satisfies Prisma.ResumeSelect;
export type ResumeListItem = Prisma.ResumeGetPayload<{ select: typeof resumeListSelect }>;

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
    readOwned(applicantId: number, id: number) {
        return this.prisma.resume.findFirst({ where: { id, applicantId }, select: { id: true, fileKey: true } });
    }
}