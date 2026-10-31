import { ServerIssue } from "@/lib/request";

export type EducationLevel = "TENTH" | "TWELFTH" | "DIPLOMA" | "GRADUATION" | "POST_GRADUATION" | "DOCTORATE";

export const EDUCATION_LEVELS: { value: EducationLevel; label: string }[] = [
    { value: "TENTH", label: "10th" },
    { value: "TWELFTH", label: "12th" },
    { value: "DIPLOMA", label: "Diploma" },
    { value: "GRADUATION", label: "Graduation" },
    { value: "POST_GRADUATION", label: "Post-graduation" },
    { value: "DOCTORATE", label: "Doctorate" },
]

export type ScopeType = "PERCENTAGE" | "CGPA"

export interface EducationDraft {
    key: number;
    level: EducationLevel;
    institution: string;
    course: string;
    startYear: string;
    endYear: string;
    score: string;
    scoreType: ScopeType;
}

export interface Draft {
    fresher: boolean;
    years: string;
    months: string;
    location: string;
    skills: string[];
    educations: EducationDraft[];
}

export const EMPTY_DRAFT: Draft = { fresher: false, years: "", months: "", location: "", skills: [], educations: []};

export type Errors = Record<string, string>;

let nextKey = 1;
export function newEducation(): EducationDraft {
    return { key: nextKey++, level: "GRADUATION", institution: "", course: "", startYear: "", endYear: "", score: "", scoreType: "PERCENTAGE"}
}

const toNumber = (s: string) => (s.trim() === "" ? undefined : Number(s));

const isBlank = (e: EducationDraft) => !e.institution.trim() && !e.course.trim() && !e.startYear.trim() && !e.endYear.trim() && !e.score.trim();
export const filledEducations = (d: Draft) => d.educations.filter((e) => !isBlank(e));

export function validateExperience(d: Draft): Errors {
    const e: Errors = {};
    if(!d.fresher){
        const years = toNumber(d.years);
        const months = toNumber(d.months);
        if(years === undefined) e.years = "Enter your years of experience (0 if less than a year)";
        else if(!Number.isInteger(years) || years < 0 || years > 60) e.years = "Enter whole years, from 0 to 60";
        if(months !== undefined && (!Number.isInteger(months) || months < 0 || months > 11)) e.months = "Enter whole months, from 0 to 11";
    }
    if(d.location.trim().length > 150) e.location = "User 150 characters or fewer";
    return e;
}

export function validateSkill(d: Draft): Errors {
    return d.skills.length > 50 ? { skills: "Add at most 50 skills" } : {}
}

export function validateEducation(d: Draft): Errors {
    const e: Errors = {};
    const validYear = (n: number | undefined) => n === undefined || (Number.isInteger(n) && n >= 1950 && n <= 2100);

    for(const edu of filledEducations(d)){
        const k = `edu.${edu.key}`;
        const institution = edu.institution.trim();
        if(!institution) e[`${k}.institution`] = "Enter the school or college";
        else if (institution.length > 150) e[`${k}.institution`] = "User 150 characters or fewer";
        if (edu.course.trim().length > 100) e[`${k}.course`] = "Use 100 characters or fewer";
        const start = toNumber(edu.startYear);
        const end = toNumber(edu.endYear);
        if (!validYear(start)) e[`${k}.startYear`] = "Enter a year, like 2019";
        if (!validYear(end)) e[`${k}.endYear`] = "Enter a year, like 2023";
        if (!e[`${k}.startYear`] && !e[`${k}.endYear`] && start !== undefined && end !== undefined && end < start) {
            e[`${k}.endYear`] = "The end year cannot be before the start year";
        }
        const score = toNumber(edu.score);
        if (score !== undefined) {
            if (!Number.isFinite(score) || score < 0 || score > 100) e[`${k}.score`] = "Enter a number from 0 to 100";
            else if (edu.scoreType === "CGPA" && score > 10) e[`${k}.score`] = "A CGPA cannot be more than 10";
        }
    }
    return e;
}


/* ---------- What the backend receives ---------- */

interface EducationBody {
    level: EducationLevel;
    institution: string;
    course?: string;
    startYear?: number;
    endYear?: number;
    score?: number;
    scoreType?: ScopeType;
}

export interface CreateApplicationBody {
    totalExpInYears: number;
    remainingExpMonths: number;
    location?: string;
    skills?: string[];
    educations?: EducationBody[];
}

export function buildBody(d: Draft): CreateApplicationBody {
    const educations: EducationBody[] = filledEducations(d).map((e) => {
        const score = toNumber(e.score);
        return {
            level: e.level,
            institution: e.institution.trim(),
            course: e.course.trim() || undefined,
            startYear: toNumber(e.startYear),
            endYear: toNumber(e.endYear),
            score,
            scoreType: score === undefined ? undefined : e.scoreType
        }
    });

    return {
        totalExpInYears: d.fresher ? 0 : (toNumber(d.years) ?? 0),
        remainingExpMonths: d.fresher ? 0 : (toNumber(d.months) ?? 0),
        location: d.location.trim() || undefined,
        skills: d.skills.length > 0 ? d.skills : undefined,
        educations: educations.length > 0 ? educations : undefined
    }
}

/**
 * The server found something wrong that the checks above missed. Put each problem next to its field
 * and say which step it belongs to, so the user can be sent back there.
 */
export function mapServerIssues(issues: ServerIssue[], d: Draft): { errors: Errors, step: number | null } {
    const errors: Errors = {};
    const sent = filledEducations(d);
    let step: number | null = null;
    const note = (target: number) => {
        if(step === null || target < step) step = target
    }

    for(const issue of issues){
        const [head, index, field] = issue.path;
        if (head === "totalExpInYears") { errors.years ??= issue.message; note(0); }
        else if (head === "remainingExpMonths") { errors.months ??= issue.message; note(0); }
        else if (head === "location") { errors.location ??= issue.message; note(0); }
        else if (head === "skills") { errors.skills ??= issue.message; note(1); }
        else if (head === "educations" && typeof index === "number" && sent[index]) {
            errors[`edu.${sent[index].key}.${String(field ?? "institution")}`] ??= issue.message;
            note(2);
        }
    }
    return { errors, step };
}