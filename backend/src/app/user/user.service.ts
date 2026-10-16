import bcrypt from "bcryptjs";
import type { UserDao } from "./user.dao.js";
import type { CreateUserDto, LoginDto } from "./user.schema.js";
import { Result, ResultCode } from "../../shared/result/result.js";
import { generateRefreshToken, hashToken, REFRESH_TTL_MS, signAccessToken } from "../../shared/auth/tokens.js";
import type { RefreshTokenDao } from "../auth/refreshToken.dao.js";
import type { Role } from "../../shared/middleware/auth.js";

export interface AuthSession {
    accessToken: string;
    refreshToken: string;
    user: { id: string; role: Role };
}

const DUMMY_HASH = bcrypt.hashSync("dummy-password-for-timing", 12);

export class UserService {
    constructor(
        private readonly userDao: UserDao,
        private readonly refreshTokenDao: RefreshTokenDao
    ) {}

    async signup(data: CreateUserDto){
        try {
            const hashPassword = await bcrypt.hash(data.password, 12);

            const user = await this.userDao.create({...data, password: hashPassword});

            console.log(user);
            return new Result(false, ResultCode.Created, "User signup successful", user.result)
        } catch (error) {
            console.error(error);
            return new Result(true, ResultCode.InternalServerError, "Internal Server Error")
        }
    }

    async login(dto: LoginDto, userAgent?: string): Promise<Result<AuthSession>> {
        const user = await this.userDao.readByEmail(dto.email);
        const valid = await bcrypt.compare(dto.password, user?.password ?? DUMMY_HASH);

        if (!user || !valid) {
            return new Result<AuthSession>(true, ResultCode.NotAuthorized, "Invalid email or password");
        }

        const session = await this.issueSession({ id: user.id, role: user.role }, userAgent);
        return new Result(false, ResultCode.Success, "Login successful", session);
    }

    async refresh(rawToken: string | undefined, userAgent?: string): Promise<Result<AuthSession>> {
        const fail = () => new Result<AuthSession>(true, ResultCode.NotAuthorized, "Invalid or expired session");

        if (!rawToken) return fail();

        const stored = await this.refreshTokenDao.findByHash(hashToken(rawToken));
        if (!stored) return fail();

        if (stored.revokedAt) {
            await this.refreshTokenDao.revokeAllForUser(stored.userId);
            return fail();
        }
        if (stored.expiresAt < new Date()) return fail();

        const claimed = await this.refreshTokenDao.revokeIfActive(stored.id);
        if (!claimed) {
            await this.refreshTokenDao.revokeAllForUser(stored.userId);
            return fail();
        }

        const user = await this.userDao.read<{ id: string; role: Role }>(stored.userId, {
            id: true,
            role: true,
        });
        if (user.status.error || !user.result) return fail();

        const session = await this.issueSession(user.result, userAgent);
        return new Result(false, ResultCode.Success, "Session refreshed", session);
    }

    async logout(rawToken: string | undefined): Promise<void> {
        if (rawToken) await this.refreshTokenDao.revokeByHash(hashToken(rawToken));
    }

    private async issueSession(
        user: { id: string; role: Role },
        userAgent?: string,
    ): Promise<AuthSession> {
        const refreshToken = generateRefreshToken();
        await this.refreshTokenDao.create({
            tokenHash: hashToken(refreshToken),
            userId: user.id,
            expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
            userAgent: userAgent?.slice(0, 255) ?? null,
        });
        return { accessToken: signAccessToken(user), refreshToken, user };
    }
}