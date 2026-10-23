import type { Company, Prisma, PrismaClient } from "../../generated/prisma/client.js";
import { BaseDao } from "../../shared/dao/base.dao.js";

export const companySelect = {
    id: true,
    name: true,
    slug: true,
    logoUrl: true,
    website: true,
    description: true,
    industry: true,
    size: true,
    foundedYear: true,
    headquarters: true,
    isVerified: true,
    createdAt: true,
} satisfies Prisma.CompanySelect;

export type CompanyResponse = Prisma.CompanyGetPayload<{ select: typeof companySelect }>;

export class CompanyDao extends BaseDao<
    Company,
    number,
    Prisma.CompanyCreateInput,
    Prisma.CompanyUpdateInput,
    Prisma.CompanyWhereInput
> {
    constructor(private readonly prisma: PrismaClient) {
        super(prisma.company, "company");
    }

    existsByName(name: string, excludeId?: number) {
        return this.prisma.company.findFirst({
            where: {
                name: { equals: name, mode: "insensitive" },
                ...(excludeId !== undefined ? { id: { not: excludeId } } : {}),
            },
            select: { id: true },
        });
    }
}