import rateLimit from "express-rate-limit";
import { Result, ResultCode } from "../result/result.js";

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

const limiter = (opts: { windowMs: number; limit: number; message: string; skipSuccessfulRequests?: boolean }) =>
    rateLimit({
        windowMs: opts.windowMs,
        limit: opts.limit,
        skipSuccessfulRequests: opts.skipSuccessfulRequests ?? false,
        standardHeaders: "draft-7",
        legacyHeaders: false,
        handler: (_req, res) => {
            const r = new Result(true, ResultCode.TooManyRequests, opts.message);
            res.status(r.getStatus()).json(r);
        }
    })

export const globalLimiter = limiter({
    windowMs: 15 * MINUTE, limit: 300,
    message: "Too many requests. Please try again later.",
});

export const loginLimiter = limiter({
    windowMs: 15 * MINUTE, limit: 10, skipSuccessfulRequests: true,
    message: "Too many failed login attempts. Try again in 15 minutes.",
});

export const signupLimiter = limiter({
    windowMs: HOUR, limit: 10,
    message: "Too many signups from this network. Try again later.",
});

export const refreshLimiter = limiter({
    windowMs: 15 * MINUTE, limit: 60,
    message: "Too many session refreshes. Try again later.",
});

export const uploadLimiter = limiter({
    windowMs: HOUR, limit: 20,
    message: "Too many uploads. Try again later.",
});

export const applyLimiter = limiter({
    windowMs: HOUR, limit: 30,
    message: "You are applying too fast. Try again later.",
});