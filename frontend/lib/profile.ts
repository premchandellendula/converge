import { useQuery } from "@tanstack/react-query";
import { dataProvider } from "@/providers/dataProvider";
import { ServerIssue } from "@/lib/request";
import {
    buildBody,
    Currency,
    Draft,
    EducationLevel,
    Errors,
    mapServerIssues,
    ScopeType,
    validateEducation,
    validateExperience,
    validatePreferences,
    validateSkill,
} from "@/app/components/onboarding/draft";

/* ---------- What GET /applicants/me returns (see backend/profile.md) ---------- */

export interface ApplicantProfile {
    id: number;
    user: { firstName: string; lastName: string; email: string; phone: string | null; avatarUrl: string | null };
    summary: string | null;
    location: string | null;
    linkedinUrl: string | null;
    githubUrl: string | null;
    industry: string | null;
    totalExpInYears: number;
    remainingExpMonths: number;
    currentSalary: number | null;
    expectedSalary: number | null;
    currency: Currency;
    noticePeriodDays: number | null;
    openToWork: boolean;
    willingToRelocate: boolean;
    preferredLocations: string[];
    skills: { name: string }[];
    educations: {
        id: number;
        level: EducationLevel;
        institution: string;
        course: string | null;
        startYear: number | null;
        endYear: number | null;
        score: string | number | null; // Prisma Decimal arrives as a string
        scoreType: ScopeType | null;
    }[];
    workExperiences: {
        id: number;
        title: string;
        companyName: string;
        location: string | null;
        startDate: string; // ISO
        endDate: string | null;
        isCurrent: boolean;
        description: string | null;
    }[];
    resumes: { id: number; fileName: string; uploadedAt: string }[];
}

export const profileKey = ["applicant", "me"] as const;

// If the API leaves out a relation (user, skills, educations...), treat it as empty instead of crashing.
function withDefaults(p: ApplicantProfile): ApplicantProfile {
    return {
        ...p,
        user: p.user ?? { firstName: "", lastName: "", email: "", phone: null, avatarUrl: null },
        skills: p.skills ?? [],
        educations: p.educations ?? [],
        workExperiences: p.workExperiences ?? [],
        resumes: p.resumes ?? [],
        preferredLocations: p.preferredLocations ?? [],
    };
}

export function useMyProfile() {
    return useQuery({
        queryKey: profileKey,
        queryFn: async () => (await dataProvider.getOne<ApplicantProfile>("applicants", "me")).data,
        select: withDefaults,
    });
}

/* ---------- Edit form ---------- */

// The onboarding Draft plus the fields that only exist on the profile page.
export interface EditDraft extends Draft {
    summary: string;
    linkedinUrl: string;
    githubUrl: string;
    industry: string;
}

const text = (v: string | null | undefined) => v ?? "";
const num = (v: number | null | undefined) => (v == null ? "" : String(v));

/** Server profile -> form strings. Keys are negative so they never clash with keys of newly added rows. */
export function profileToDraft(p: ApplicantProfile): EditDraft {
    const hasExperience = p.totalExpInYears > 0 || p.remainingExpMonths > 0 || p.workExperiences.length > 0;

    return {
        fresher: !hasExperience,
        years: hasExperience ? String(p.totalExpInYears) : "",
        months: p.remainingExpMonths > 0 ? String(p.remainingExpMonths) : "",
        location: text(p.location),
        experiences: p.workExperiences.map((x, i) => ({
            key: -(i + 1),
            title: x.title,
            company: x.companyName,
            startDate: x.startDate.slice(0, 7),
            endDate: x.endDate ? x.endDate.slice(0, 7) : "",
            current: x.isCurrent,
            description: text(x.description),
        })),
        skills: p.skills.map((s) => s.name),
        educations: p.educations.map((e, i) => ({
            key: -(i + 1),
            level: e.level,
            institution: e.institution,
            course: text(e.course),
            startYear: num(e.startYear),
            endYear: num(e.endYear),
            score: e.score == null ? "" : String(Number(e.score)),
            scoreType: e.scoreType ?? "PERCENTAGE",
        })),
        currency: p.currency,
        currentSalary: num(p.currentSalary),
        expectedSalary: num(p.expectedSalary),
        noticePeriodDays: num(p.noticePeriodDays),
        openToWork: p.openToWork,
        willingToRelocate: p.willingToRelocate,
        preferredLocations: p.preferredLocations.join(", "),
        summary: text(p.summary),
        linkedinUrl: text(p.linkedinUrl),
        githubUrl: text(p.githubUrl),
        industry: text(p.industry),
    };
}

/* ---------- Validation ---------- */

function normalizeUrl(raw: string): string {
    const t = raw.trim();
    if (!t) return "";
    return /^https?:\/\//i.test(t) ? t : `https://${t}`;
}

function isValidUrl(raw: string): boolean {
    try {
        const u = new URL(normalizeUrl(raw));
        return (u.protocol === "http:" || u.protocol === "https:") && u.hostname.includes(".");
    } catch {
        return false;
    }
}

export const SUMMARY_MAX = 2000;

export function validateAbout(d: EditDraft): Errors {
    const e: Errors = {};
    if (d.summary.trim().length > SUMMARY_MAX) e.summary = `Use ${SUMMARY_MAX} characters or fewer`;
    if (d.industry.trim().length > 100) e.industry = "Use 100 characters or fewer";
    if (d.linkedinUrl.trim() && !isValidUrl(d.linkedinUrl)) e.linkedinUrl = "Enter a valid link, like linkedin.com/in/your-name";
    if (d.githubUrl.trim() && !isValidUrl(d.githubUrl)) e.githubUrl = "Enter a valid link, like github.com/your-name";
    return e;
}

export function validateAll(d: EditDraft): Errors {
    return {
        ...validateAbout(d),
        ...validateExperience(d),
        ...validateSkill(d),
        ...validateEducation(d),
        ...validatePreferences(d),
    };
}

/* ---------- What PATCH /applicants/me receives ---------- */

const orNull = (s: string) => s.trim() || null;

/**
 * Unlike onboarding, an update must be able to CLEAR things, so empty optional fields are sent as
 * null and empty lists as []. The backend schema has to accept null for these (see backend/profile.md).
 */
export function buildUpdateBody(d: EditDraft) {
    const base = buildBody(d);
    return {
        totalExpInYears: base.totalExpInYears,
        remainingExpMonths: base.remainingExpMonths,
        currency: base.currency,
        currentSalary: base.currentSalary ?? null,
        expectedSalary: base.expectedSalary ?? null,
        noticePeriodDays: base.noticePeriodDays ?? null,
        openToWork: base.openToWork,
        willingToRelocate: base.willingToRelocate,
        preferredLocations: base.preferredLocations ?? [],
        location: base.location ?? null,
        skills: base.skills ?? [],
        educations: base.educations ?? [],
        workExperiences: base.workExperiences ?? [],
        summary: orNull(d.summary),
        linkedinUrl: orNull(normalizeUrl(d.linkedinUrl)),
        githubUrl: orNull(normalizeUrl(d.githubUrl)),
        industry: orNull(d.industry),
    };
}

/** Server messages next to their fields. */
export function mapUpdateIssues(issues: ServerIssue[], d: EditDraft): Errors {
    const { errors } = mapServerIssues(issues, d);
    for (const issue of issues) {
        const head = String(issue.path[0]);
        if (["summary", "linkedinUrl", "githubUrl", "industry"].includes(head)) errors[head] ??= issue.message;
    }
    return errors;
}