"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";


export type JobType = "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP";
export type WorkMode = "ONSITE" | "HYBRID" | "REMOTE";

export interface JobCardData {
    id: number;
    title: string;
    location: string;
    jobType: JobType;
    workMode: WorkMode;
    experienceMin: number | null;
    experienceMax: number | null;
    salaryMin: number | null;
    salaryMax: number | null;
    currency: string;
    createdAt: string;
    status?: "OPEN" | "CLOSED";
    expiresAt?: string | null;
    company: { id: number; name: string; slug: string; logoUrl: string | null };
    skills: { name: string }[];
}

export interface JobCardProps {
    job: JobCardData;
    href: string;
    companyHref?: string;
    isSaved?: boolean;
    isApplied?: boolean;
    onToggleSave?: (jobId: number, nextSaved: boolean) => void;
    onHide?: (jobId: number) => void;
    onReport?: (jobId: number) => void;
    maxSkills?: number;
}

const JOB_TYPE_LABEL: Record<JobType, string> = {
    FULL_TIME: "Full-time",
    PART_TIME: "Part-time",
    CONTRACT: "Contract",
    INTERNSHIP: "Internship",
};

const WORK_MODE_LABEL: Record<WorkMode, string> = {
    ONSITE: "On-site",
    HYBRID: "Hybrid",
    REMOTE: "Remote",
};

const years = (n: number) => `${n} ${n === 1 ? "yr" : "yrs"}`;

export function formatExperience(min: number | null, max: number | null): string {
    if (min != null && max != null) return min === max ? years(min) : `${min}–${max} yrs`;
    if (min != null) return `${min}+ yrs`;
    if (max != null) return `Up to ${years(max)}`;
    return "Any experience";
}

export function formatSalary(min: number | null, max: number | null, currency: string): string {
    if (min == null && max == null) return "Salary not disclosed";

    if (currency === "INR") {
        const lpa = (n: number) => {
            const v = n / 100_000;
            return Number.isInteger(v) ? String(v) : v.toFixed(1);
        };
        if (min != null && max != null) return min === max ? `₹${lpa(min)} LPA` : `₹${lpa(min)}–${lpa(max)} LPA`;
        if (max != null) return `Up to ₹${lpa(max)} LPA`;
        if (min != null) return `₹${lpa(min)}+ LPA`;
    }

    const money = new Intl.NumberFormat("en", {
        style: "currency",
        currency,
        notation: "compact",
        maximumFractionDigits: 1,
    });
    if (min != null && max != null) return min === max ? money.format(min) : `${money.format(min)}–${money.format(max)}`;
    if (max != null) return `Up to ${money.format(max)}`;
    if (min != null) return `${money.format(min)}+`;
    return "Salary not disclosed";
}

export function formatPosted(iso: string): string {
    const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
    if (days <= 0) return "Posted today";
    if (days === 1) return "Posted yesterday";
    if (days < 30) return `Posted ${days} days ago`;
    const months = Math.floor(days / 30);
    return `Posted ${months} ${months === 1 ? "month" : "months"} ago`;
}

function CompanyLogo({ name, logoUrl }: { name: string; logoUrl: string | null }) {
    const [failed, setFailed] = useState(false);

    if (!logoUrl || failed) {
        return (
            <div
                aria-hidden="true"
                className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-stone-100 text-lg font-semibold text-stone-600 dark:bg-stone-800 dark:text-stone-300"
            >
                {name.trim().charAt(0).toUpperCase()}
            </div>
        );
    }

    return (
        <Image
            src={logoUrl}
            alt="" 
            width={48}
            height={48}
            onError={() => setFailed(true)}
            className="h-12 w-12 shrink-0 rounded-lg border border-stone-200 bg-white object-contain p-1 dark:border-stone-700"
        />
    );
}

function BookmarkIcon({ filled }: { filled: boolean }) {
    return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 3.75h12a.75.75 0 0 1 .75.75v16.5L12 16.5 5.25 21V4.5A.75.75 0 0 1 6 3.75Z" />
        </svg>
    );
}

function DotsIcon() {
    return (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                <circle cx="12" cy="5" r="1.8" />
                <circle cx="12" cy="12" r="1.8" />
                <circle cx="12" cy="19" r="1.8" />
            </svg>
    );
}

const iconButton =
    "relative z-10 grid h-9 w-9 place-items-center rounded-md text-stone-500 hover:bg-stone-100 hover:text-stone-900 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-teal-600 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-50";

function MoreMenu({ onHide, onReport }: { onHide?: () => void; onReport?: () => void }) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const onPointerDown = (e: MouseEvent) => {
            if (!ref.current?.contains(e.target as Node)) setOpen(false);
        };
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        document.addEventListener("mousedown", onPointerDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("mousedown", onPointerDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [open]);

    if (!onHide && !onReport) return null;

    const item =
        "block w-full px-3 py-2 text-left text-sm text-stone-700 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800";

    return (
        <div ref={ref} className="relative z-10">
            <button
                type="button"
                className={iconButton}
                aria-haspopup="menu"
                aria-expanded={open}
                aria-label="More actions"
                onClick={() => setOpen((v) => !v)}
            >
                <DotsIcon />
            </button>
            {open && (
                <div
                    role="menu"
                    className="absolute right-0 top-full z-20 mt-1 w-44 overflow-hidden rounded-md border border-stone-200 bg-white py-1 shadow-lg dark:border-stone-700 dark:bg-stone-900"
                >
                    {onHide && (
                        <button type="button" role="menuitem" className={item} onClick={() => { setOpen(false); onHide(); }}>
                            Hide this job
                        </button>
                    )}
                    {onReport && (
                        <button type="button" role="menuitem" className={item} onClick={() => { setOpen(false); onReport(); }}>
                            Report this job
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

export function JobCard({
    job,
    href,
    companyHref,
    isSaved = false,
    isApplied = false,
    onToggleSave,
    onHide,
    onReport,
    maxSkills = 4,
}: JobCardProps) {
    const [initialTime] = useState(() => Date.now());
    const closed =
        job.status === "CLOSED" || (job.expiresAt != null && new Date(job.expiresAt).getTime() < initialTime);

    const visibleSkills = job.skills.slice(0, maxSkills);
    const hiddenSkillCount = job.skills.length - visibleSkills.length;

    const tag =
        "rounded-md border border-stone-300 px-2 py-0.5 text-xs text-stone-700 dark:border-stone-700 dark:text-stone-300";
    const skillTag =
        "rounded-md bg-stone-100 px-2 py-0.5 text-xs text-stone-700 dark:bg-stone-800 dark:text-stone-300";

    return (
        <article
            className={`relative flex gap-4 rounded-lg border border-stone-200 bg-white p-4 transition-colors hover:border-stone-400 dark:border-stone-800 dark:bg-stone-900 dark:hover:border-stone-600 ${
                closed ? "opacity-70" : ""
            }`}
        >
            <CompanyLogo name={job.company.name} logoUrl={job.company.logoUrl} />

            <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold text-stone-900 dark:text-stone-50">
                        <Link
                            href={href}
                            className="outline-none after:absolute after:inset-0 after:rounded-lg focus-visible:after:outline-2 focus-visible:after:outline-teal-600"
                        >
                            {job.title}
                        </Link>
                    </h3>
                    {companyHref ? (
                        <Link href={companyHref} className="relative z-10 text-sm text-stone-600 hover:underline dark:text-stone-400">
                            {job.company.name}
                        </Link>
                        ) : (
                        <p className="text-sm text-stone-600 dark:text-stone-400">{job.company.name}</p>
                    )}
                </div>

                <div className="flex shrink-0 items-center gap-1">
                    {onToggleSave && (
                        <button
                            type="button"
                            className={`${iconButton} ${isSaved ? "text-teal-700 dark:text-teal-400" : ""}`}
                            aria-pressed={isSaved}
                            aria-label={isSaved ? "Remove from saved jobs" : "Save job"}
                            onClick={() => onToggleSave(job.id, !isSaved)}
                        >
                            <BookmarkIcon filled={isSaved} />
                        </button>
                    )}
                    <MoreMenu
                        onHide={onHide ? () => onHide(job.id) : undefined}
                        onReport={onReport ? () => onReport(job.id) : undefined}
                    />
                </div>
                </div>

                <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-stone-700 dark:text-stone-300">
                    <div>
                        <dt className="sr-only">Location</dt>
                        <dd>{job.location}</dd>
                    </div>
                    <div>
                        <dt className="sr-only">Experience</dt>
                        <dd>{formatExperience(job.experienceMin, job.experienceMax)}</dd>
                    </div>
                    <div>
                        <dt className="sr-only">Salary</dt>
                        <dd className="font-semibold tabular-nums text-stone-900 dark:text-stone-50">
                        {formatSalary(job.salaryMin, job.salaryMax, job.currency)}
                        </dd>
                    </div>
                </dl>

                <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Job type, work mode and skills">
                    <li className={tag}>{WORK_MODE_LABEL[job.workMode]}</li>
                    <li className={tag}>{JOB_TYPE_LABEL[job.jobType]}</li>
                    {visibleSkills.map((s) => (
                        <li key={s.name} className={skillTag}>
                        {s.name}
                        </li>
                    ))}
                    {hiddenSkillCount > 0 && <li className={skillTag}>+{hiddenSkillCount} more</li>}
                </ul>

                <div className="mt-3 flex items-center justify-between gap-3 text-xs text-stone-500 dark:text-stone-400">
                    <span>{formatPosted(job.createdAt)}</span>
                    <span className="flex items-center gap-2">
                        {isApplied && (
                        <span className="rounded-md bg-teal-50 px-2 py-0.5 font-medium text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                            Applied
                        </span>
                        )}
                        {closed && (
                        <span className="rounded-md bg-stone-200 px-2 py-0.5 font-medium text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                            Closed
                        </span>
                        )}
                    </span>
                </div>
            </div>
        </article>
    );
}