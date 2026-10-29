import { friendlyMessage } from "@/lib/notify";
import { ApiError, ServerIssue } from "@/lib/request";
import { CreateJobBody, JobType, WorkMode } from "@/lib/types";
import { useMemo, useState, type FormEvent, type KeyboardEvent } from "react";
import { Alert, FieldError, inputClass, labelClass, primaryButton } from "../ui";
import { JOB_TYPE_OPTIONS, WORK_MODE_OPTIONS } from "@/lib/jobFilters";

type Field = 
    | "title" | "location" | "description" | "jobType" | "workMode"
    | "experienceMin" | "experienceMax" | "salaryMin" | "salaryMax"
    | "currency" | "openings" | "expiresAt" | "skills";

type FieldErrors = Partial<Record<Field, string>>;

interface Values {
    title: string;
    location: string;
    description: string;
    jobType: JobType;
    workMode: WorkMode;
    experienceMin: string;
    experienceMax: string;
    salaryMin: string;
    salaryMax: string;
    currency: string;
    openings: string;
    expiresAt: string; // YYYY-MM-DD
    skills: string[];
    skillInput: string;
}

const CURRENCIES = ["INR", "USD", "EUR", "GBP"];
const FIELD_ORDER: Field[] = [
    "title", "location", "workMode", "jobType", "description", "experienceMin", "experienceMax",
    "currency", "salaryMin", "salaryMax", "skills", "openings", "expiresAt",
];

const EMPTY: Values = {
    title: "", location: "", description: "", jobType: "FULL_TIME", workMode: "ONSITE", experienceMin: "", experienceMax: "", salaryMin: "", salaryMax: "", currency: "INR", openings: "", expiresAt: "", skills: [], skillInput: "",
};

const optionalNumber = (s: string) => (s.trim() === "" ? undefined : Number(s));

const salaryMultiplier = (currency: string) => (currency === "INR" ? 100_000 : 1);

function todayLocal(){
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function validate(v: Values, today: string): FieldErrors {
    const e: FieldErrors = {};
    const title = v.title.trim();
    const location = v.location.trim();
    const description = v.description.trim();

    if (title.length < 3) e.title = "Enter a job title (at least 3 characters)";
    else if (title.length > 150) e.title = "Use 150 characters or fewer";
    if (location.length < 2) e.location = "Enter a location";
    else if (location.length > 100) e.location = "Use 100 characters or fewer";
    if (description.length < 20) e.description = "Describe the role in at least 20 characters";
    else if (description.length > 10_000) e.description = "Use 10,000 characters or fewer";

    const expMin = optionalNumber(v.experienceMin);
    const expMax = optionalNumber(v.experienceMax);
    const validYears = (n: number | undefined) => n === undefined || (Number.isInteger(n) && n >= 0 && n <= 60);
    if (!validYears(expMin)) e.experienceMin = "Enter whole years, from 0 to 60";
    if (!validYears(expMax)) e.experienceMax = "Enter whole years, from 0 to 60";
    if (!e.experienceMin && !e.experienceMax && expMin !== undefined && expMax !== undefined && expMin > expMax) {
        e.experienceMax = "Maximum must be at least the minimum";
    }

    const salMin = optionalNumber(v.salaryMin);
    const salMax = optionalNumber(v.salaryMax);
    const validSalary = (n: number | undefined) => n === undefined || (Number.isFinite(n) && n >= 0);
    if (!validSalary(salMin)) e.salaryMin = "Enter a number that is 0 or more";
    if (!validSalary(salMax)) e.salaryMax = "Enter a number that is 0 or more";
    if (!e.salaryMin && !e.salaryMax && salMin !== undefined && salMax !== undefined && salMin > salMax) {
        e.salaryMax = "Maximum must be at least the minimum";
    }

    const openings = optionalNumber(v.openings);
    if (openings !== undefined && (!Number.isInteger(openings) || openings < 1 || openings > 1000)) {
        e.openings = "Enter a whole number from 1 to 1000";
    }
    if (v.expiresAt && v.expiresAt < today) e.expiresAt = "Choose today or a later date";
    if (v.skills.length > 30) e.skills = "Add at most 30 skills";
    
    return e;
}

function buildBody(v: Values): CreateJobBody {
    const mult = salaryMultiplier(v.currency);
    const money = (s: string) => {
        const n = optionalNumber(s);
        return n === undefined ? undefined : Math.round(n * mult);
    }

    return {
        title: v.title.trim(),
        description: v.description.trim(),
        location: v.location.trim(),
        jobType: v.jobType,
        workMode: v.workMode,
        experienceMin: optionalNumber(v.experienceMin),
        experienceMax: optionalNumber(v.experienceMax),
        salaryMin: money(v.salaryMin),
        salaryMax: money(v.salaryMax),
        currency: v.currency,
        openings: optionalNumber(v.openings),
        expiresAt: v.expiresAt ? new Date(`${v.expiresAt}T23:59:59`).toISOString() : undefined, // end of that day
        skills: v.skills.length ? v.skills : undefined,
    };
}

function splitIssues(issues: ServerIssue[]): { fields: FieldErrors; other: string[] } {
    const fields: FieldErrors = {};
    const other: string[] = [];
    for (const issue of issues) {
        const key = issue.path[0] as Field | undefined;
        if (key && FIELD_ORDER.includes(key)) {
            if (!fields[key]) fields[key] = issue.message;
        } else {
            other.push(issue.message);
        }
    }
    return { fields, other };
}

export interface JobFormProps {
    initial?: Partial<Values>;
    submitLabel?: string;
    isSubmitting: boolean;
    error: ApiError | null;
    onSubmit: (body: CreateJobBody) => void;
    onEdit?: () => void;
}

export function JobForm({ initial, submitLabel = "Post job", isSubmitting, error, onSubmit, onEdit }: JobFormProps){
    const [values, setValues] = useState<Values>({...EMPTY, ...initial});
    const [clientErrors, setClientErrors] = useState<FieldErrors>({});
    const [today] = useState(todayLocal);

    const { fields: serverFieldErrors, other: serverOther } = useMemo(() => splitIssues(error?.issues ?? []), [error]);
    const errors: FieldErrors = { ...serverFieldErrors, ...clientErrors };
    const formMessages = error ? (serverOther.length > 0 ? serverOther : Object.keys(serverFieldErrors).length === 0 ? [friendlyMessage(error)] : []) : [];

    const isInr = values.currency === "INR";
    const salaryUnit = isInr ? "LPA" : `${values.currency} per year`;

    function set<K extends keyof Values>(key: K, value: Values[K]){
        setValues((prev) => ({ ...prev, [key]: value }));
        if(clientErrors[key as Field]) setClientErrors((prev) => ({ ...prev, [key]: undefined }));
        onEdit?.();
    }

    function addSkills(raw: string){
        const incoming = raw.split(",").map((s) => s.trim()).filter(Boolean);
        if(incoming.length === 0) return;
        const have = new Set(values.skills.map((s) => s.toLowerCase()));
        const next = [...values.skills];
        for(const skill of incoming){
            if(skill.length <= 50 && !have.has(skill.toLowerCase())){
                next.push(skill);
                have.add(skill.toLowerCase());
            }
        }

        setValues((prev) => ({ ...prev, skills: next, skillInput: ""}));
        onEdit?.()
    }

    function onSkillKeyDown(e: KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault(); // Enter must add a skill here, not submit the whole form
            addSkills(values.skillInput);
        }
    }

    const focusFirst = (errs: FieldErrors) => {
        const first = FIELD_ORDER.find((f) => errs[f]);
        if (first) document.getElementById(`job-${first}`)?.focus();
    };

    function handleSubmit(e: FormEvent<HTMLFormElement>){
        e.preventDefault();
        if(isSubmitting) return;

        const current: Values = values.skillInput.trim()
            ? { ...values, skills: [...values.skills, ...values.skillInput.split(",").map((s) => s.trim()).filter(Boolean)], skillInput: ""}
            : values;

        const found = validate(current, today);
        setClientErrors(found);
        if (Object.keys(found).length > 0) {
            focusFirst(found);
            return;
        }
        onSubmit(buildBody(current));
    }

    const describedBy = (field: Field, hint?: string) => (errors[field] ? `job-${field}-error` : hint);

    return (
        <form onSubmit={handleSubmit} noValidate className="space-y-8">
            {formMessages.length > 0 && (
                <Alert>
                    {formMessages.map((m) => (
                        <p key={m}>{m}</p>
                    ))}
                </Alert>
            )}

            <section className="space-y-5">
                <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-50">The role</h2>

                <div>
                    <label htmlFor="job-title" className={labelClass}>Job title</label>
                    <input id="job-title" className={inputClass} value={values.title} placeholder="Node.js Developer" onChange={(e) => set("title", e.target.value)} aria-invalid={Boolean(errors.title)} aria-describedby={describedBy("title")} />
                    <FieldError id="job-title-error" message={errors.title} />
                </div>

                <div className="grid gap-5 sm:grid-cols-3">
                    <div>
                        <label 
                            htmlFor="job-location" 
                            className={labelClass}
                        >
                            Location
                        </label>
                        <input 
                            id="job-location" 
                            className={inputClass} 
                            value={values.location} placeholder="Hyderabad"
                            onChange={(e) => set("location", e.target.value)} 
                            aria-invalid={Boolean(errors.location)} aria-describedby={describedBy("location")} 
                        />
                        <FieldError id="job-location-error" message={errors.location} />
                    </div>

                    <div>
                        <label 
                            htmlFor="job-workMode" 
                            className={labelClass}
                        >
                            Work mode
                        </label>
                        <select 
                            id="job-workMode" 
                            className={inputClass}
                            value={values.workMode}
                            onChange={(e) => set("workMode", e.target.value as WorkMode)}
                            aria-invalid={Boolean(errors.workMode)}
                        >
                            {WORK_MODE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                        <FieldError id="job-workMode-error" message={errors.workMode} />
                    </div>
                    <div>
                        <label 
                            htmlFor="job-jobType" 
                            className={labelClass}
                        >
                            Job type
                        </label>
                        <select 
                            id="job-jobType" 
                            className={inputClass} 
                            value={values.jobType}
                            onChange={(e) => set("jobType", e.target.value as JobType)} 
                            aria-invalid={Boolean(errors.jobType)}
                        >
                            {JOB_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                        <FieldError id="job-jobType-error" message={errors.jobType} />
                    </div>
                </div>
                <div>
                    <label 
                        htmlFor="job-description" 
                        className={labelClass}
                    >
                        Description
                    </label>
                    <textarea 
                        id="job-description" 
                        rows={8} 
                        className={inputClass} 
                        value={values.description}
                        placeholder="What will this person do? What does the team work on? What do you need from them?"
                        onChange={(e) => set("description", e.target.value)} 
                        aria-invalid={Boolean(errors.description)} aria-describedby={describedBy("description")} 
                    />
                    <FieldError id="job-description-error" message={errors.description} />
                </div>
            </section>

            <section className="space-y-5">
                <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-50">Experience and pay</h2>

                <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                        <label htmlFor="job-experienceMin" className={labelClass}>Minimum experience (years)</label>
                        <input id="job-experienceMin" inputMode="numeric" className={inputClass} value={values.experienceMin} placeholder="1" onChange={(e) => set("experienceMin", e.target.value)} aria-invalid={Boolean(errors.experienceMin)} aria-describedby={describedBy("experienceMin")} />
                        <FieldError id="job-experienceMin-error" message={errors.experienceMin} />
                    </div>
                    <div>
                        <label htmlFor="job-experienceMax" className={labelClass}>Maximun experience (years)</label>
                        <input id="job-experienceMax" inputMode="numeric" className={inputClass} value={values.experienceMax} placeholder="3" onChange={(e) => set("experienceMax", e.target.value)} aria-invalid={Boolean(errors.experienceMax)} aria-describedby={describedBy("experienceMax")} />
                        <FieldError id="job-experienceMax-error" message={errors.experienceMax} />
                    </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-3">
                    <div>
                        <label htmlFor="job-currency" className={labelClass}>Currency</label>
                        <select id="job-currency" className={inputClass} value={values.currency} onChange={(e) => set("currency", e.target.value)}>
                            {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="job-salaryMin" className={labelClass}>Minimum salary ({salaryUnit})</label>
                        <input id="job-salaryMin" inputMode="decimal" className={inputClass} value={values.salaryMin} placeholder={isInr ? "6" : "60000"}
                        onChange={(e) => set("salaryMin", e.target.value)} aria-invalid={Boolean(errors.salaryMin)} aria-describedby={describedBy("salaryMin", "job-salary-hint")} />
                        <FieldError id="job-salaryMin-error" message={errors.salaryMin} />
                    </div>
                    <div>
                        <label htmlFor="job-salaryMax" className={labelClass}>Maximum salary ({salaryUnit})</label>
                        <input id="job-salaryMax" inputMode="decimal" className={inputClass} value={values.salaryMax} placeholder={isInr ? "10" : "90000"}
                        onChange={(e) => set("salaryMax", e.target.value)} aria-invalid={Boolean(errors.salaryMax)} aria-describedby={describedBy("salaryMax", "job-salary-hint")} />
                        <FieldError id="job-salaryMax-error" message={errors.salaryMax} />
                    </div>
                </div>
                <p id="job-salary-hint" className="-mt-2 text-xs text-stone-500 dark:text-stone-400">
                    {isInr ? "In lakh per year. For example, 7.5 means ₹7,50,000 a year." : "The full amount per year."} Leave both empty to not show a salary.
                </p>
            </section>

            <section className="space-y-5">
                <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-50">Skills and details</h2>

                <div>
                    <label htmlFor="job-skills" className={labelClass}>Skills</label>
                    <input id="job-skills" className={inputClass} value={values.skillInput} placeholder="Type a skill and press Enter" onChange={(e) => setValues((prev) => ({ ...prev, skillInput: e.target.value }))}
                    onKeyDown={onSkillKeyDown} onBlur={() => addSkills(values.skillInput)}
                    aria-invalid={Boolean(errors.skills)}
                    aria-describedby={describedBy("skills")}
                    />
                    <FieldError id="job-skills-error" message={errors.skills} />
                    {values.skills.length > 0 && (
                        <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Added skills">
                            {values.skills.map((skill) => (
                                <li key={skill} className="flex items-center gap-1 rounded-md bg-stone-100 py-0.5 pl-2 pr-1 text-xs text-stone-800 dark:bg-stone-800 dark:text-stone-200">
                                    {skill}
                                    <button type="button" aria-label={`Remove ${skill}`}
                                        onClick={() => set("skills", values.skills.filter((s) => s !== skill))}
                                        className="grid h-5 w-5 place-items-center rounded hover:bg-stone-200 dark:hover:bg-stone-700"
                                    >
                                        ×
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                        <label htmlFor="job-openings" className={labelClass}>Number of openings</label>
                        <input id="job-openings" inputMode="numeric" className={inputClass} value={values.openings} placeholder="1"
                        onChange={(e) => set("openings", e.target.value)} aria-invalid={Boolean(errors.openings)} aria-describedby={describedBy("openings")} />
                        <FieldError id="job-openings-error" message={errors.openings} />
                    </div>
                    <div>
                        <label htmlFor="job-expiresAt" className={labelClass}>Accept applications until (optional)</label>
                        <input id="job-expiresAt" type="date" min={today} className={inputClass} value={values.expiresAt}
                        onChange={(e) => set("expiresAt", e.target.value)} aria-invalid={Boolean(errors.expiresAt)} aria-describedby={describedBy("expiresAt")} />
                        <FieldError id="job-expiresAt-error" message={errors.expiresAt} />
                    </div>
                </div>
            </section>
            <button type="submit" disabled={isSubmitting} className={primaryButton}>
                {isSubmitting ? "Saving…" : submitLabel}
            </button>
        </form>
    )
}