import { useQuery } from "@tanstack/react-query";
import { expireSession, refreshSession } from "@/lib/api";
import { toQueryString } from "@/lib/queryString";
import { ApiError, ServerIssue } from "@/lib/request";
import { API_BASE } from "@/providers/api.config";
import {
    JobFacets,
    JobFilterSet,
    JobFilters,
    MyApplicationItem,
    SavedJobItem
} from "@/lib/types";

/**
 * Every query key in the app lives here. A key is an address in TanStack's cache:
 * invalidating ["jobs"] refreshes everything that starts with it (lists, facets, details).
 */
export const queryKeys = {
    me: ["me"] as const, // same value as meKey in lib/auth.ts

    jobs: {
        all: ["jobs"] as const,
        list: (filters: JobFilters) => ["jobs", "list", filters] as const,
        facets: (filters: JobFilterSet) => ["jobs", "facets", filters] as const,
        detail: (id: number) => ["jobs", "detail", id] as const
    },

    applications: {
        all: ["applications"] as const,
        ids: ["applications", "ids"] as const,
        mine: (page: number, limit: number) =>
            ["applications", "mine", page, limit] as const
    },

    savedJobs: {
        all: ["saved-jobs"] as const,
        ids: ["saved-jobs", "ids"] as const,
        list: (page: number, limit: number) =>
            ["saved-jobs", "list", page, limit] as const
    },

    resumes: ["resumes"] as const,

    recruiter: {
        all: ["recruiter"] as const,
        postings: (page: number, limit: number) =>
            ["recruiter", "postings", page, limit] as const
    }
};

/** The `{ status, message, result, count }` envelope every backend endpoint returns. */
export interface Envelope<T> {
    status: { code: string; error: boolean };
    message?: string;
    result: T | null;
    count?: number | null;
}

export class HttpError extends ApiError {
    constructor(
        message: string,
        status: number,
        issues: ServerIssue[] = [],
        readonly data?: unknown,
        readonly url?: string
    ) {
        super(message, status, issues);
        this.name = "HttpError";
    }
}

export interface HttpResult<T = unknown> {
    json: Envelope<T>;
    message?: string;
}

type QueryInput = Record<string, unknown>;

interface ReactAdminListParams {
    pagination?: { page?: number; perPage?: number; nonPaginated?: boolean };
    sort?: { field?: string; order?: string } | string;
    filter?: QueryInput;
    meta?: QueryInput & { filter?: QueryInput; nonPaginated?: boolean };
}

/**
 * Flattens react-admin style params ({ pagination, sort, filter, meta }) and plain
 * query objects (JobFilters) into one query string. Arrays become CSV values.
 */
function toQuery(params: object): string {
    const flat: QueryInput = { ...(params as QueryInput) };
    const pagination = flat.pagination as ReactAdminListParams["pagination"];
    const sort = flat.sort;
    const filter = flat.filter as QueryInput | undefined;
    const meta = flat.meta as ReactAdminListParams["meta"];
    delete flat.pagination;
    delete flat.filter;
    delete flat.meta;

    if (pagination) {
        if (pagination.nonPaginated) {
            flat.nonPaginated = "true";
        } else {
            if (pagination.page !== undefined) flat.page = pagination.page;
            if (pagination.perPage !== undefined) flat.limit = pagination.perPage;
        }
    }
    if (sort && typeof sort === "object") {
        const s = sort as { field?: string; order?: string };
        if (s.field) flat.orderBy = s.field;
        if (s.order) flat.order = s.order;
    }
    if (filter) Object.assign(flat, filter);
    if (meta) {
        for (const [key, value] of Object.entries(meta)) {
            if (key !== "filter" && key !== "nonPaginated") flat[key] = value;
        }
        if (meta.filter) Object.assign(flat, meta.filter);
        if (meta.nonPaginated) flat.nonPaginated = "true";
    }
    return toQueryString(flat);
}

function toSearchString(query: string): URLSearchParams {
    return new URLSearchParams(query.replace(/^\?/, ""));
}

/**
 * Auth lives in an httpOnly cookie (`credentials: "include"`); on 401 we refresh the
 * session once and retry. Responses come back as `{ json, message }` — errors throw
 * `HttpError` (an `ApiError`, so `friendlyMessage` and `JobForm` keep working).
 */
export async function HttpClient<T = unknown>(
    url: string,
    options: RequestInit = {},
    cache: RequestCache = "no-cache"
): Promise<HttpResult<T>> {
    const headers = new Headers({ Accept: "application/json", ...options.headers });
    if (typeof options.body === "string" && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    const send = () =>
        fetch(`${API_BASE}${url}`, { ...options, headers, cache, credentials: "include" });

    let res: Response;
    try {
        res = await send();
    } catch {
        throw new ApiError("Could not reach the server. Check your connection and try again.", 0);
    }

    if (res.status === 401 && !url.startsWith("/users/")) {
        if (await refreshSession()) {
            res = await send();
        } else {
            expireSession();
        }
    }

    let raw: unknown = null;
    try {
        raw = await res.json();
    } catch {
        // non-JSON body
    }

    const envelope =
        raw && typeof raw === "object" && "status" in raw ? (raw as Envelope<T>) : null;

    if (res.status === 413 || res.status === 206) {
        return {
            json: envelope ?? {
                status: { code: String(res.status), error: false },
                result: null
            },
            message: envelope?.message ?? "Loaded"
        };
    }

    if (!envelope) {
        throw new HttpError(
            res.ok ? "Unexpected response from the server." : `Request failed (${res.status})`,
            res.status || 0,
            [],
            raw,
            url
        );
    }

    if (envelope.status.error) {
        throw new HttpError(
            envelope.message ?? "Something went wrong. Try again.",
            Number(envelope.status.code) || res.status || 500,
            Array.isArray(envelope.result) ? (envelope.result as ServerIssue[]) : [],
            envelope,
            url
        );
    }

    return { json: envelope, message: envelope.message };
}

export const dataProvider = {
    getList: async <T = unknown>(
        resource: string,
        params: object = {}
    ): Promise<{ data: T[]; total: number }> => {
        const { json } = await HttpClient<T[]>(`/${resource}${toQuery(params)}`);
        const items = json.result ?? [];
        return { data: items, total: json.count ?? items.length };
    },

    getOne: async <T = unknown>(
        resource: string,
        id: number | string,
        params: QueryInput = {}
    ) => {
        const { json } = await HttpClient<T>(`/${resource}/${id}${toQueryString(params)}`);
        return { data: json.result as T };
    },

    /** Hook version of getOne — call only from components, never conditionally. */
    GetOne: <T = unknown>(
        resource: string,
        params: { id?: number | string; meta?: QueryInput; additionalQueryKey?: unknown } = {}
    ) => {
        const url = `/${resource}/${params.id}${toQueryString(params.meta ?? {})}`;
        return useQuery({
            queryKey:
                params.additionalQueryKey !== undefined
                    ? [resource, "detail", params.id, params.additionalQueryKey]
                    : [resource, "detail", params.id],
            queryFn: async () => {
                const { json } = await HttpClient<T>(url);
                return { data: json.result as T };
            },
            enabled: Boolean(params.id)
        });
    },

    getMany: async <T = unknown>(
        resource: string,
        params: QueryInput & { ids: Array<number | string> }
    ) => {
        const { ids, ...rest } = params;
        const search = toSearchString(toQuery(rest));
        for (const id of ids) search.append("id", String(id));
        search.set("nonPaginated", "true");
        const { json } = await HttpClient<T[]>(`/${resource}?${search.toString()}`);
        return { data: json.result ?? [] };
    },

    create: async <T = { id: number | string }>(
        resource: string,
        params: { data: object }
    ) => {
        const { json } = await HttpClient<{ id?: number | string } | number | string>(
            `/${resource}`,
            { method: "POST", body: JSON.stringify(params.data) }
        );
        const created = json.result;
        const id =
            (typeof created === "object" && created !== null ? created.id : created) ??
            (params.data as { id?: number | string }).id;
        return {
            data: { ...(params.data as object), id } as T & { id?: number | string },
            message: json.message,
            status: json.status,
            result: created
        };
    },

    /** Backend job/applicant updates use PATCH. */
    update: async (resource: string, params: { id: number | string; data: object }) => {
        const { json } = await HttpClient(`/${resource}/${params.id}`, {
            method: "PATCH",
            body: JSON.stringify(params.data)
        });
        return {
            data: { ...(params.data as object), id: params.id },
            message: json.message,
            status: json.status,
            result: json.result
        };
    },

    delete: async (resource: string, params: { id: number | string; data?: object }) => {
        const { json } = await HttpClient(`/${resource}/${params.id}`, {
            method: "DELETE",
            body: JSON.stringify(params.data ?? {})
        });
        return { data: json.result, message: json.message, status: json.status };
    },

    /** DELETE with extra query params (e.g. saved-bookmark style endpoints). */
    bookmarkDelete: async (
        resource: string,
        params: { id: number | string; meta?: QueryInput; data?: object }
    ) => {
        const { json } = await HttpClient(
            `/${resource}/${params.id}${toQueryString(params.meta ?? {})}`,
            { method: "DELETE", body: params.data ? JSON.stringify(params.data) : undefined }
        );
        return { data: json.result, message: json.message, status: json.status };
    },

    getManyReference: async <T = unknown>(
        resource: string,
        params: QueryInput & { target: string; value?: string | number; id?: string | number }
    ) => {
        const { target, value, id, ...rest } = params;
        const search = toSearchString(toQuery(rest));
        search.set(target, String(value ?? id));
        const { json } = await HttpClient<T[]>(`/${resource}?${search.toString()}`);
        const items = json.result ?? [];
        return { data: items, total: json.count ?? items.length };
    },

    // ---- domain helpers ----

    getJobFacets: async (filters: JobFilterSet = {}): Promise<JobFacets> => {
        const { json } = await HttpClient<JobFacets>(`/jobs/facets${toQueryString(filters)}`);
        return json.result as JobFacets;
    },

    listSavedJobs: async <T = SavedJobItem>(params: { page?: number; limit?: number } = {}) => {
        const { data: items, total } = await dataProvider.getList<T>("applicants/me/saved-jobs", params);
        return { items, count: total };
    },

    listMyApplications: async <T = MyApplicationItem>(page = 1, limit = 10) => {
        const { data: items, total } = await dataProvider.getList<T>("applicants/applications/me", {
            page,
            limit
        });
        return { items, count: total };
    },

    saveJob: async (jobId: number) => {
        const { json } = await HttpClient(`/applicants/me/saved-jobs/${jobId}`, {
            method: "POST"
        });
        return json.result;
    },

    unsaveJob: async (jobId: number) => {
        const { json } = await HttpClient(`/applicants/me/saved-jobs/${jobId}`, {
            method: "DELETE"
        });
        return json.result;
    },

    uploadResume: (file: File) => {
        const form = new FormData();
        form.append("file", file); // the backend reads the field called "file"
        return HttpClient<{ id: number }>("/applicants/me/resumes", { method: "POST", body: form });
    },
    // searchSkills: (q: string, limit = 10) => get<SkillOption[]>(`/skills${query({ q, limit })}`),
} as const;

export type DataProvider = typeof dataProvider;
