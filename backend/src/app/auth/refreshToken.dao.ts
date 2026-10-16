import type { Prisma, PrismaClient, RefreshToken } from "../../generated/prisma/client.js";
import { BaseDao } from "../../shared/dao/base.dao.js";

export class RefreshTokenDao extends BaseDao<
    RefreshToken,
    string,
    Prisma.RefreshTokenUncheckedCreateInput,
    Prisma.RefreshTokenUpdateInput,
    Prisma.RefreshTokenWhereInput
> {
    constructor(private readonly prisma: PrismaClient) {
        super(prisma.refreshToken, "refreshToken");
    }

    findByHash(tokenHash: string) {
        return this.prisma.refreshToken.findUnique({ where: { tokenHash } });
    }

    async revokeIfActive(id: string): Promise<boolean> {
        const { count } = await this.prisma.refreshToken.updateMany({
            where: { id, revokedAt: null },
            data: { revokedAt: new Date() },
        });
        return count === 1;
    }

    revokeAllForUser(userId: string) {
        return this.prisma.refreshToken.updateMany({
            where: { userId, revokedAt: null },
            data: { revokedAt: new Date() },
        });
    }

    revokeByHash(tokenHash: string) {
        return this.prisma.refreshToken.updateMany({
            where: { tokenHash, revokedAt: null },
            data: { revokedAt: new Date() },
        });
    }
}