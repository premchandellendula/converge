import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import type { AuthUser, Role } from "../middleware/auth.js";

export const ACCESS_TTL_SECONDS = 15 * 60;
export const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const secret = process.env.JWT_SECRET;
if(!secret || secret.length < 32){
    throw new Error("JWT_SECRET must be set and at least 32 characters");
}

export function signAccessToken(user: AuthUser): string {
    return jwt.sign({ role: user.role }, secret!, {
        subject: user.id,
        expiresIn: ACCESS_TTL_SECONDS,
        algorithm: "HS256"
    })
}

export function verifyAccessToken(token: string): AuthUser | null {
    try {
        const payload = jwt.verify(token, secret!, { algorithms: ["HS256"] }) as jwt.JwtPayload;
        if (!payload.sub || typeof payload.role !== "string") return null;
        return { id: payload.sub, role: payload.role as Role };
    } catch {
        return null; // expired, tampered, malformed
    }
}

export const generateRefreshToken = () => crypto.randomBytes(48).toString("base64url");
export const hashToken = (token: string) => crypto.createHash("sha256").update(token).digest("hex");