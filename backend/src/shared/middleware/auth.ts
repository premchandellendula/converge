import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { Role as PrismaRole } from "../../generated/prisma/enums.js";
import { Result, ResultCode } from "../result/result.js";
import { verifyAccessToken } from "../auth/tokens.js";

export type Role = PrismaRole
export interface AuthUser {
    id: string;
    role: Role;
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction){
    const header = req.header("authorization");
    const bearer = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

    const token: string | undefined = req.cookies?.access_token ?? bearer;

    if(token){
        const user = verifyAccessToken(token);
        if(user) req.user = user;
    }
    next();
}

export const requireRole =
    (...roles: Role[]): RequestHandler =>
    (req, res, next) => {
        if (!req.user) {
            const r = new Result(true, ResultCode.NotAuthorized, "Authentication required");
            res.status(r.getStatus()).json(r);
            return;
        }
        if (!roles.includes(req.user.role)) {
            const r = new Result(true, ResultCode.Forbidden, "Forbidden");
            res.status(r.getStatus()).json(r);
            return;
        }
    next();
};