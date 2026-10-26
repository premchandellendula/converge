import { api } from "./api";

export interface ServerIssue {
    path: (string | number)[];
    message: string;
}

export class ApiError extends Error {
    constructor(
        message: string,
        public readonly status: number,
        public readonly issues: ServerIssue[] = []
    ){
        super(message);
        this.name = "ApiError";
    }
}

function toApiError(message: string | undefined, code: string, result: unknown): ApiError {
    const issues = Array.isArray(result) ? (result as ServerIssue[]): [];
    return new ApiError(message ?? "Something went wrong. Try again.", Number(code) || 500, issues)
}

export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    let res;
    try {
        res = await api<T | ServerIssue[]>(path, init);
    } catch {
        throw new ApiError("Could not reach the server. Check your connection and try again.", 0);
    }
    if (res.status.error) throw toApiError(res.message, res.status.code, res.result);
    return res.result as T;
}

export async function requestList<T>(path: string, init: RequestInit = {}): Promise<{ items: T[]; count: number }> {
    let res;
    try {
        res = await api<T[]>(path, init);
    } catch {
        throw new ApiError("Could not reach the server. Check your connection and try again.", 0);
    }
    if (res.status.error) throw toApiError(res.message, res.status.code, res.result);
    const items = res.result ?? [];
    return { items, count: res.count ?? items.length };
}