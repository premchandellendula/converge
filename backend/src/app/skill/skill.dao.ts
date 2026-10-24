import type { Prisma, PrismaClient, Skill } from "../../generated/prisma/client.js";
import { BaseDao } from "../../shared/dao/base.dao.js";

export class SkillDao extends BaseDao<
    Skill,
    number,
    Prisma.SkillCreateInput,
    Prisma.SkillUpdateInput,
    Prisma.SkillWhereInput
> {
    constructor(private readonly prisma: PrismaClient) {
        super(prisma.skill, "skill");
    }

    async idsForNames(names: string[]) {
        const unique = [...new Set(names)];
        if (unique.length === 0) return [];

        await this.prisma.skill.createMany({
            data: unique.map((name) => ({ name })),
            skipDuplicates: true,
        });
        return this.prisma.skill.findMany({
            where: { name: { in: unique } },
            select: { id: true },
        });
    }

    search(q: string, limit: number) {
        return this.prisma.skill.findMany({
            where: { name: { contains: q, mode: "insensitive" } },
            select: { id: true, name: true },
            orderBy: { name: "asc" },
            take: limit,
        });
    }
}