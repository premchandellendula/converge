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

export const DESCRIPTION_MAX = 1000;
export const SUPPORTS_EXPERIENCES = false;
export type Currency = "INR" | "USD" | "EUR" | "GBP";
export const CURRENCIES: { value: Currency; label: string }[] = [
    { value: "INR", label: "INR (₹)" },
    { value: "USD", label: "USD ($)" },
    { value: "EUR", label: "EUR (€)" },
    { value: "GBP", label: "GBP (£)" },
];

export interface ExperienceDraft {
    key: number;
    title: string;
    company: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
}

let experienceKey = 0;
export const newExperience = (): ExperienceDraft => ({
    key: Date.now() + experienceKey++,
    title: "",
    company: "",
    startDate: "",
    endDate: "",
    current: false,
    description: ""
})

export interface Draft {
    fresher: boolean;
    years: string;
    months: string;
    location: string;
    experiences: ExperienceDraft[];
    skills: string[];
    educations: EducationDraft[];
    currency: Currency;
    currentSalary: string;
    expectedSalary: string;
    noticePeriodDays: string;
    openToWork: boolean;
    willingToRelocate: boolean;
    preferredLocations: string
}

export const EMPTY_DRAFT: Draft = { fresher: false, years: "", months: "", location: "", experiences: [], skills: [], educations: [], currency: "INR", currentSalary: "", expectedSalary: "", noticePeriodDays: "", openToWork: true, willingToRelocate: false, preferredLocations: "",};

export type Errors = Record<string, string>;

let nextKey = 1;
export function newEducation(): EducationDraft {
    return { key: nextKey++, level: "GRADUATION", institution: "", course: "", startYear: "", endYear: "", score: "", scoreType: "PERCENTAGE"}
}

const toNumber = (s: string) => (s.trim() === "" ? undefined : Number(s));
const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;
const currentMonth = () => new Date().toISOString().slice(0, 7);

const isBlank = (e: EducationDraft) => !e.institution.trim() && !e.course.trim() && !e.startYear.trim() && !e.endYear.trim() && !e.score.trim();
export const filledEducations = (d: Draft) => d.educations.filter((e) => !isBlank(e));

const isBlankExperience = (x: ExperienceDraft) => !x.title.trim() && !x.company.trim() && !x.startDate && !x.endDate && !x.description.trim() && !x.current;
export const filledExperiences = (d: Draft) => (d.fresher ? [] : d.experiences.filter((x) => !isBlankExperience(x)));

export function validateExperience(d: Draft): Errors {
    const e: Errors = {};
    if(!d.fresher){
        const years = toNumber(d.years);
        const months = toNumber(d.months);
        if(years === undefined) e.years = "Enter your years of experience (0 if less than a year)";
        else if(!Number.isInteger(years) || years < 0 || years > 60) e.years = "Enter whole years, from 0 to 60";
        if(months !== undefined && (!Number.isInteger(months) || months < 0 || months > 11)) e.months = "Enter whole months, from 0 to 11";

        const thisMonth = currentMonth();
        for(const x of filledExperiences(d)){
            const k = `exp.${x.key}`;
            const title = x.title.trim();
            const company = x.company.trim();

            if(!title) e[`${k}.title`] = "Enter your job title";
            else if (title.length > 100) e[`${k}.title`] = "Use 100 characters or fewer";

            if (!company) e[`${k}.company`] = "Enter the company name";
            else if (company.length > 150) e[`${k}.company`] = "Use 150 characters or fewer";
            
            if (!MONTH.test(x.startDate)) e[`${k}.startDate`] = "Choose a start month";
            else if (x.startDate > thisMonth) e[`${k}.startDate`] = "The start date cannot be in the future";

            if (!x.current) {
                if (!MONTH.test(x.endDate)) e[`${k}.endDate`] = "Choose an end month, or tick \"I currently work here\"";
                else if (x.endDate > thisMonth) e[`${k}.endDate`] = "The end date cannot be in the future";
                else if (!e[`${k}.startDate`] && x.endDate < x.startDate) e[`${k}.endDate`] = "The end date cannot be before the start date";
            }

            if (x.description.length > DESCRIPTION_MAX) e[`${k}.description`] = `Use ${DESCRIPTION_MAX} characters or fewer`;
        }
    }
    if(d.location.trim().length > 150) e.location = "User 150 characters or fewer";
    return e;
}

export function validateSkill(d: Draft): Errors {
    return d.skills.length > 50 ? { skills: "Add at most 50 skills" } : {}
}
const toAmount = (s: string) => {
    const t = s.replace(/[,\s]/g, "");
    return t === "" ? undefined : Number(t);
}

export const splitLocations = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);

export function validatePreferences(d: Draft): Errors {
    const e: Errors = {};
    for (const field of ["currentSalary", "expectedSalary"] as const) {
        const n = toAmount(d[field]);
        if (n !== undefined && (!Number.isInteger(n) || n < 0 || n > 2_000_000_000)) e[field] = "Enter a whole number";
    }
    const notice = toNumber(d.noticePeriodDays);
    if (notice !== undefined && (!Number.isInteger(notice) || notice < 0 || notice > 365)) {
        e.noticePeriodDays = "Enter whole days, from 0 to 365";
    }
    if (splitLocations(d.preferredLocations).length > 10) e.preferredLocations = "Add at most 10 locations";
    return e;
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

interface ExperienceBody {
    title: string;
    companyName: string;
    startDate: string;
    endDate?: string;
    isCurrent: boolean;
    description?: string;
}

export interface CreateApplicationBody {
    totalExpInYears: number;
    remainingExpMonths: number;
    currency: Currency;
    currentSalary?: number;
    expectedSalary?: number;
    noticePeriodDays?: number;
    openToWork: boolean;
    willingToRelocate: boolean;
    preferredLocations?: string[];
    location?: string;
    skills?: string[];
    educations?: EducationBody[];
    workExperiences?: ExperienceBody[];
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

    const experiences: ExperienceBody[] = filledExperiences(d).map((x) => ({
        title: x.title.trim(),
        companyName: x.company.trim(),
        startDate: `${x.startDate}-01`,
        endDate: x.current ? undefined : `${x.endDate}-01`,
        isCurrent: x.current,
        description: x.description.trim() || undefined
    }));

    return {
        totalExpInYears: d.fresher ? 0 : (toNumber(d.years) ?? 0),
        remainingExpMonths: d.fresher ? 0 : (toNumber(d.months) ?? 0),
        currency: d.currency,
        currentSalary: toAmount(d.currentSalary),
        expectedSalary: toAmount(d.expectedSalary),
        noticePeriodDays: toNumber(d.noticePeriodDays),
        openToWork: d.openToWork,
        willingToRelocate: d.willingToRelocate,
        preferredLocations: splitLocations(d.preferredLocations).length > 0 ? splitLocations(d.preferredLocations) : undefined,
        location: d.location.trim() || undefined,
        skills: d.skills.length > 0 ? d.skills : undefined,
        educations: educations.length > 0 ? educations : undefined,
        workExperiences: experiences.length > 0 ? experiences : undefined
    }
}

/**
 * The server found something wrong that the checks above missed. Put each problem next to its field
 * and say which step it belongs to, so the user can be sent back there.
 */
export function mapServerIssues(issues: ServerIssue[], d: Draft): { errors: Errors, step: number | null } {
    const errors: Errors = {};
    const sent = filledEducations(d);
    const sentExperiences = filledExperiences(d);
    let step: number | null = null;
    const note = (target: number) => {
        if(step === null || target < step) step = target
    }

    for(const issue of issues){
        const [head, index, field] = issue.path;
        if (head === "totalExpInYears") { errors.years ??= issue.message; note(0); }
        else if (head === "remainingExpMonths") { errors.months ??= issue.message; note(0); }
        else if (head === "location") { errors.location ??= issue.message; note(0); }
        else if (head === "workExperiences" && typeof index === "number" && sentExperiences[index]) {
            // server field names -> the form field that shows the message
            const formField = field === "companyName" ? "company" : field === "isCurrent" ? "endDate" : String(field ?? "title");
            errors[`exp.${sentExperiences[index].key}.${formField}`] ??= issue.message;
            note(2);
        }
        else if (head === "currency" || head === "currentSalary" || head === "expectedSalary" || head === "noticePeriodDays" || head === "preferredLocations") {
            errors[String(head)] ??= issue.message; note(3);
        }
        else if (head === "skills") { errors.skills ??= issue.message; note(1); }
        else if (head === "educations" && typeof index === "number" && sent[index]) {
            errors[`edu.${sent[index].key}.${String(field ?? "institution")}`] ??= issue.message;
            note(2);
        }
    }
    return { errors, step };
}