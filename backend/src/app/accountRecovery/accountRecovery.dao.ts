import crypto from 'node:crypto'
import type { PrismaClient } from '../../generated/prisma/client.js';

export type EmailTokenType = "VERIFY_EMAIL" | "RESET_PASSWORD";

const hash = (token: string) => crypto.createHash("sha256").update(token).digest("hex");
const COOLDOWN_MS = 60_000;

export class AccountRecoveryDao {
    constructor(private readonly prisma: PrismaClient) {}

    findByUserId(id: string){
        return this.prisma.user.findUnique({ where: { id }, select: { id: true, email: true, firstName: true, isEmailVerified: true }});
    }

    findUserByEmail(email: string){
        return this.prisma.user.findFirst({
            where: { email: { equals: email, mode: "insensitive"} },
            select: { id: true, email: true, firstName: true }
        })
    }

    async issueToken(userId: string, type: EmailTokenType, ttlMs: number): Promise<string | null> {
        const recent = await this.prisma.emailToken.findFirst({
            where: { userId, type, usedAt: null, createdAt: { gt: new Date(Date.now() - COOLDOWN_MS) } },
            select: { id: true },
        })
        if(recent) return null;

        const token = crypto.randomBytes(32).toString("base64url");
        await this.prisma.$transaction([
            this.prisma.emailToken.deleteMany({ where: { userId, type, usedAt: null } }),
            this.prisma.emailToken.create({
                data: { userId, type, tokenHash: hash(token), expiresAt: new Date(Date.now() + ttlMs) },
            })
        ])
        return token;
    }

    findUsableToken(token: string, type: EmailTokenType) {
        return this.prisma.emailToken.findFirst({
            where: { tokenHash: hash(token), type, usedAt: null, expiresAt: { gt: new Date() } },
            select: { id: true, userId: true }
        })
    }

    async completeVerification(tokenId: string, userId: string) {
        await this.prisma.$transaction([
            this.prisma.emailToken.update({ where: { id: tokenId }, data: { usedAt: new Date() } }),
            this.prisma.user.update({ where: { id: userId }, data: { isEmailVerified: true } }),
        ]);
    }

    async completeReset(tokenId: string, userId: string, passwordHash: string) {
        const now = new Date();
        await this.prisma.$transaction([
            this.prisma.user.update({ where: { id: userId }, data: { password: passwordHash } }),
            this.prisma.emailToken.updateMany({ where: { userId, type: "RESET_PASSWORD", usedAt: null }, data: { usedAt: now } }),
            this.prisma.refreshToken.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: now } }),
        ]);
        void tokenId; // the updateMany above already marked this token as used
    }
}