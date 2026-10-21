import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { Result, ResultCode } from "../result/result.js";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    const r =
        err instanceof ZodError
        ? new Result(true, ResultCode.BadRequest, "Validation failed", err.issues)
        : new Result(true, ResultCode.InternalServerError, "Internal server error");

    if (!(err instanceof ZodError)) console.error(err);
    res.status(r.getStatus()).json(r);
}