import type { Response } from "express";

export enum ResultCode {
    Success = "200",
    Created = "201",
    Accepted = "202",
    BadRequest = "400",
    NotAuthorized = "401",
    Forbidden = "403",
    NotFound = "404",
    Conflict = "409",
    NoUpdatesPerformed = "NO_UPDATES",
    InternalServerError = "500",
}

const httpStatus: Record<ResultCode, number> = {
    [ResultCode.Success]: 200,
    [ResultCode.Created]: 201,
    [ResultCode.Accepted]: 202,
    [ResultCode.BadRequest]: 400,
    [ResultCode.NotAuthorized]: 401,
    [ResultCode.Forbidden]: 403,
    [ResultCode.NotFound]: 404,
    [ResultCode.Conflict]: 409,
    [ResultCode.NoUpdatesPerformed]: 200,
    [ResultCode.InternalServerError]: 500,
};

export class Result<T = undefined> {
    readonly status: { code: ResultCode; error: boolean };
    readonly message?: string;
    readonly result: T | null;

    constructor(error: boolean, code: ResultCode, message?: string, result?: T) {
        this.status = { code, error };
        this.message = message;
        this.result = result ?? null;
    }

    getStatus(): number {
        return httpStatus[this.status.code];
    }
}

export class ResultWithCount<T> extends Result<T> {
    constructor(
        error: boolean,
        code: ResultCode,
        message: string | undefined,
        result: T | undefined,
        readonly count: number | null = null,
    ) {
        super(error, code, message, result);
    }
}