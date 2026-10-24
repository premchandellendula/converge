import type { CookieOptions, Request, Response } from "express";
import type { UserService } from "./user.service.js";
import { createUserSchema, loginSchema } from "./user.schema.js";
import { Result, ResultCode } from "../../shared/result/result.js";
import { ACCESS_TTL_SECONDS, REFRESH_TTL_MS } from "../../shared/auth/tokens.js";


const isProd = process.env.NODE_ENV === "production";
const base: CookieOptions = { httpOnly: true, secure: isProd, sameSite: "lax" };

// The refresh cookie is only sent to /auth routes, so it isn't attached to every request
const accessCookie: CookieOptions = { ...base, path: "/", maxAge: ACCESS_TTL_SECONDS * 1000 };
const refreshCookie: CookieOptions = { ...base, path: "/api/v1/users", maxAge: REFRESH_TTL_MS };

export class UserController {
    constructor(private readonly service: UserService) {}

    signup = async (req: Request, res: Response) => {
        const response = createUserSchema.safeParse(req.body);

        if(!response.success){
            const r = new Result(true, ResultCode.BadRequest, "Incorrect inputs", response.error.issues);
            res.status(r.getStatus()).json(r);
            return;
        }

        const result = await this.service.signup(response.data);
        res.status(result.getStatus()).json(result);        
    }

    login = async (req: Request, res: Response) => {
        const parsed = loginSchema.safeParse(req.body);
        if (!parsed.success) {
            const r = new Result(true, ResultCode.BadRequest, "Incorrect inputs", parsed.error.issues);
            res.status(r.getStatus()).json(r);
            return;
        }
        const result = await this.service.login(parsed.data, req.header("user-agent"));
        this.respondWithSession(res, result, "Login successful");
    };

    refresh = async (req: Request, res: Response) => {
        const result = await this.service.refresh(
            req.cookies?.refresh_token,
            req.header("user-agent"),
        );
        this.respondWithSession(res, result, "Session refreshed");
    };

    logout = async (req: Request, res: Response) => {
        await this.service.logout(req.cookies?.refresh_token);
        res.clearCookie("access_token", { ...base, path: "/" });
        res.clearCookie("refresh_token", { ...base, path: "/api/v1/auth" });
        const r = new Result(false, ResultCode.Success, "Logged out");
        res.status(r.getStatus()).json(r);
    };

    private respondWithSession(
        res: Response,
        result: Result<{ accessToken: string; refreshToken: string; user: { id: string; role: string } }>,
        message: string,
    ) {
        if (result.status.error || !result.result) {
            res.status(result.getStatus()).json(result);
            return;
        }
        const { accessToken, refreshToken, user } = result.result;
        res.cookie("access_token", accessToken, accessCookie);
        res.cookie("refresh_token", refreshToken, refreshCookie);
        const r = new Result(false, ResultCode.Success, message, { user });
        res.status(r.getStatus()).json(r);
    }

    me = async (req: Request, res: Response) => {
        const result = await this.service.me(req.user!.id);
        res.status(result.getStatus()).json(result);
    };
}