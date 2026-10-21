import type { Prisma, PrismaClient, RecruiterDetails } from "../../generated/prisma/client.js";
import { BaseDao } from "../../shared/dao/base.dao.js";

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
}