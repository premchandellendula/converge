import { ServerIssue } from "@/lib/request";

export type Errors = Record<string, string>;

export const BIO_MAX = 1000;
export const COMPANY_DESCRIPTION_MAX = 2000;

export interface RecruiterDraft {
    designation: string;
    department: string;
    workEmail: string;
    linkedinUrl: string;
    bio: string;
    companyName: string;
    website: string;
    headquarters: string;
    companyDescription: string;
}

export const EMPTY_RECRUITER_DRAFT: RecruiterDraft = {
    designation: "", department: "", workEmail: "", linkedinUrl: "", bio: "",
    companyName: "", website: "", headquarters: "", companyDescription: "",
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeUrl(raw: string): string {
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

export function validateAbout(d: RecruiterDraft): Errors {
    const e: Errors = {};
    const designation = d.designation.trim();
    if (!designation) e.designation = "Enter your job title";
    else if (designation.length < 2) e.designation = "Use at least 2 characters";
    else if (designation.length > 100) e.designation = "Use 100 characters or fewer";

    if (d.department.trim().length > 100) e.department = "Use 100 characters or fewer";

    if (d.workEmail.trim() && !EMAIL.test(d.workEmail.trim())) e.workEmail = "Enter a valid email address";

    if (d.linkedinUrl.trim() && !isValidUrl(d.linkedinUrl)) e.linkedinUrl = "Enter a valid link, like linkedin.com/in/your-name";

    if (d.bio.trim().length > BIO_MAX) e.bio = `Use ${BIO_MAX} characters or fewer`;
    return e;
}

export function validateCompany(d: RecruiterDraft): Errors {
    const e: Errors = {};
    const name = d.companyName.trim();
    if (!name) e.companyName = "Enter your company name";
    else if (name.length < 2) e.companyName = "Use at least 2 characters";
    else if (name.length > 100) e.companyName = "Use 100 characters or fewer";

    if (d.website.trim() && !isValidUrl(d.website)) e.website = "Enter a valid website, like acme.com";
    if (d.headquarters.trim().length > 100) e.headquarters = "Use 100 characters or fewer";
    if (d.companyDescription.trim().length > COMPANY_DESCRIPTION_MAX) {
        e.companyDescription = `Use ${COMPANY_DESCRIPTION_MAX} characters or fewer`;
    }
    return e;
}

export interface CreateRecruiterBody {
    designation: string;
    department?: string;
    workEmail?: string;
    linkedinUrl?: string;
    bio?: string;
    company: {
        name: string;
        website?: string;
        description?: string;
        headquarters?: string;
    };
}

const orUndefined = (s: string) => s.trim() || undefined;

export function buildRecruiterBody(d: RecruiterDraft): CreateRecruiterBody {
    return {
        designation: d.designation.trim(),
        department: orUndefined(d.department),
        workEmail: orUndefined(d.workEmail),
        linkedinUrl: orUndefined(normalizeUrl(d.linkedinUrl)),
        bio: orUndefined(d.bio),
        company: {
            name: d.companyName.trim(),
            website: orUndefined(normalizeUrl(d.website)),
            description: orUndefined(d.companyDescription),
            headquarters: orUndefined(d.headquarters),
        },
    };
}

export function mapRecruiterIssues(issues: ServerIssue[]): { errors: Errors; step: number | null } {
    const errors: Errors = {};
    let step: number | null = null;
    const note = (target: number) => {
        if (step === null || target < step) step = target;
    };

    const companyFields: Record<string, string> = {
        name: "companyName",
        website: "website",
        description: "companyDescription",
        headquarters: "headquarters",
    };

    for (const issue of issues) {
        const [head, field] = issue.path;
        if (head === "company") {
            errors[companyFields[String(field)] ?? "companyName"] ??= issue.message;
            note(1);
        } else if (["designation", "department", "workEmail", "linkedinUrl", "bio"].includes(String(head))) {
            errors[String(head)] ??= issue.message;
            note(0);
        }
    }
    return { errors, step };
}