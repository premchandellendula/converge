import { API_BASE } from "@/providers/api.config";

export interface ApiResult<T> {
    status: { code: string; error: boolean };
    message?: string;
    result: T | null;
    count?: number | null;
}

const NO_REFRESH = new Set(["/users/login", "/users/signup", "/users/refresh", "/users/logout"]);

const SILENT_WHEN_EXPIRED = new Set(["/users/me"]);

let onSessionExpired: () => void = () => {
    window.location.assign("/login");
};
export function setSessionExpiredHandler(handler: () => void) {
    onSessionExpired = handler;
}

let expiring = false;
export function expireSession() {
    if (expiring) return;
    expiring = true;
    onSessionExpired();
    setTimeout(() => {
        expiring = false;
    }, 2000);
}

let refreshing: Promise<boolean> | null = null;

export function refreshSession(): Promise<boolean> {
    refreshing ??= fetch(`${API_BASE}/users/refresh`, { method: "POST", credentials: "include" })
        .then((res) => res.ok)
        .catch(() => false)
        .finally(() => {
            refreshing = null;
        });
    return refreshing;
}


function buildInit(init: RequestInit): RequestInit {
    const headers = new Headers(init.headers);
    if (typeof init.body === "string" && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }
    return { ...init, headers, credentials: "include" };
}

function isApiResult(value: unknown): value is ApiResult<unknown> {
    const status = (value as { status?: { error?: unknown } } | null)?.status;
    return typeof status === "object" && status !== null && typeof status.error === "boolean";
}

async function parse<T>(res: Response): Promise<ApiResult<T>> {
    try {
        const body: unknown = await res.json();
        if (isApiResult(body)) return body as ApiResult<T>;
    } catch {
        // fall through
    }
    return {
        status: { code: res.ok ? "500" : String(res.status), error: true },
        message: res.ok ? "Unexpected response from the server." : undefined,
        result: null,
    };
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<ApiResult<T>> {
    if (typeof window === "undefined") {
        throw new Error("api() runs in the browser only. On the server, call fetch with the full API URL.");
    }

    const route = path.split("?")[0] ?? path;
    const options = buildInit(init);

    let res = await fetch(`${API_BASE}${path}`, options);

    if (res.status === 401 && !NO_REFRESH.has(route)) {
        if (await refreshSession()) {
            res = await fetch(`${API_BASE}${path}`, options); // retry once with the new cookies
        } else if (!SILENT_WHEN_EXPIRED.has(route)) {
            expireSession();
        }
    }

    return parse<T>(res);
}