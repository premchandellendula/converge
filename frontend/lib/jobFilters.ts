import { JobFilters, JobType, WorkMode } from "./types";

const LPA = 100_000;
export const PAGE_SIZE = 10;

export const JOB_TYPE_OPTIONS: { value: JobType; label: string}[] = [
    { value: "FULL_TIME", label: "Full-time" },
    { value: "PART_TIME", label: "Part-time" },
    { value: "CONTRACT", label: "Contract" },
    { value: "INTERNSHIP", label: "Internship" },
]

export const WORK_MODE_OPTIONS: { value: WorkMode; label: string }[] = [
    { value: "REMOTE", label: "Remote" },
    { value: "HYBRID", label: "Hybrid" },
    { value: "ONSITE", label: "On-site" },
];

export interface Bucket {
    key: string;
    label: string;
    min: number;
    max: number | null; // null = no upper limit
}

export const EXPERIENCE_BUCKETS: Bucket[] = [
    { key: "0-1", label: "0–1 years", min: 0, max: 1 },
    { key: "1-3", label: "1–3 years", min: 1, max: 3 },
    { key: "3-5", label: "3–5 years", min: 3, max: 5 },
    { key: "5-8", label: "5–8 years", min: 5, max: 8 },
    { key: "8+", label: "8+ years", min: 8, max: null },
];

export const SALARY_BUCKETS: Bucket[] = [
    { key: "0-3", label: "Up to ₹3 LPA", min: 0, max: 3 },
    { key: "3-6", label: "₹3–6 LPA", min: 3, max: 6 },
    { key: "6-10", label: "₹6–10 LPA", min: 6, max: 10 },
    { key: "10-15", label: "₹10–15 LPA", min: 10, max: 15 },
    { key: "15-25", label: "₹15–25 LPA", min: 15, max: 25 },
    { key: "25+", label: "₹25+ LPA", min: 25, max: null },
];

export const POSTED_OPTIONS = [
    { value: 1, label: "Last 24 hours" },
    { value: 3, label: "Last 3 days" },
    { value: 7, label: "Last 7 days" },
    { value: 30, label: "Last 30 days" },
];

export type SortKey = "recent" | "popular";
export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
    { value: "recent", label: "Most recent" },
    { value: "popular", label: "Most applied" },
];

export interface UiFilters {
    q: string;
    jobType: JobType[];
    workMode: WorkMode[];
    location: string[];
    exp: string | null;
    salary: string | null;
    postedWithin: number | null;
    sort: SortKey;
    page: number;
}

export const EMPTY_FILTERS: UiFilters = {
    q: "",
    jobType: [],
    workMode: [],
    location: [],
    exp: null,
    salary: null,
    postedWithin: null,
    sort: "recent",
    page: 1,
};

const JOB_TYPES = new Set<string>(JOB_TYPE_OPTIONS.map((o) => o.value));
const WORK_MODES = new Set<string>(WORK_MODE_OPTIONS.map((o) => o.value));
const list = (v: string | null) => (v ? v.split(",").map((s) => s.trim()).filter(Boolean) : []);

export function parseFilters(sp: URLSearchParams): UiFilters {
    const exp = sp.get("exp");
    const salary = sp.get("salary");
    const posted = Number(sp.get("posted"));
    const page = Math.floor(Number(sp.get("page")));

    return {
        q: (sp.get("q") ?? "").trim().slice(0, 100),
        jobType: list(sp.get("jobType")).filter((v): v is JobType => JOB_TYPES.has(v)),
        workMode: list(sp.get("workMode")).filter((v): v is WorkMode => WORK_MODES.has(v)),
        location: list(sp.get("location")).slice(0, 10),
        exp: EXPERIENCE_BUCKETS.some((b) => b.key === exp) ? exp : null,
        salary: SALARY_BUCKETS.some((b) => b.key === salary) ? salary : null,
        postedWithin: POSTED_OPTIONS.some((o) => o.value === posted) ? posted : null,
        sort: sp.get("sort") === "popular" ? "popular" : "recent",
        page: Number.isFinite(page) && page >= 1 ? page : 1,
    }
}

export function toSearchParams(f: UiFilters): URLSearchParams {
    const sp = new URLSearchParams();
    if(f.q) sp.set("q", f.q);
    if(f.jobType.length) sp.set("jobType", f.jobType.join(","));
    if (f.workMode.length) sp.set("workMode", f.workMode.join(","));
    if (f.location.length) sp.set("location", f.location.join(","));
    if(f.exp) sp.set("exp", f.exp);
    if(f.salary) sp.set("salary", f.salary);
    if(f.postedWithin) sp.set("posted", String(f.postedWithin));
    if(f.sort !== "recent") sp.set("sort", f.sort);
    if(f.page > 1) sp.set("page", String(f.page));
    return sp;
}

export function toApiFilters(f: UiFilters): JobFilters {
    const exp = EXPERIENCE_BUCKETS.find((b) => b.key === f.exp);
    const salary = SALARY_BUCKETS.find((b) => b.key === f.salary);

    return {
        q: f.q || undefined,
        jobType: f.jobType,
        workMode: f.workMode,
        location: f.location,
        expMin: exp?.min,
        expMax: exp?.max ?? undefined,
        salaryMin: salary ? salary.min * LPA : undefined,
        salaryMax: salary && salary.max !== null ? salary.max * LPA : undefined,
        postedWithin: f.postedWithin ?? undefined,
        sort: f.sort,
        page: f.page,
        limit: PAGE_SIZE,
    };
}

export function activeFilterCount(f: UiFilters): number {
    return (
        f.jobType.length +
        f.workMode.length +
        f.location.length +
        (f.exp ? 1 : 0) +
        (f.salary ? 1 : 0) +
        (f.postedWithin ? 1 : 0)
    );
}