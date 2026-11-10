"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import {
    CompanyLogo,
    formatExperience,
    formatSalary,
    jobTypeLabel,
    timeAgo,
    workModeLabel,
} from "@/app/components/jobs/JobCard";
import { ApplicationStatusBadge } from "../jobs/ApplicationStatusBadge";
import { ApplicationCardData } from "@/lib/types";

export const WITHDRAWABLE = new Set(["APPLIED", "SHORTLISTED", "INTERVIEW"]);

// The happy path. REJECTED and WITHDRAWN end the process, so they only show the badge.
const PIPELINE = [
    { status: "APPLIED", label: "Applied" },
    { status: "SHORTLISTED", label: "Shortlisted" },
    { status: "INTERVIEW", label: "Interview" },
    { status: "HIRED", label: "Hired" },
];

function Progress({ status }: { status: string }) {
    const current = PIPELINE.findIndex((s) => s.status === status);
    if (current === -1) return null;

    return (
        <ol aria-label="Application progress" className="mt-3 flex items-center">
            {PIPELINE.map((step, i) => {
                const done = i < current;
                const active = i === current;
                const isLast = i === PIPELINE.length - 1;

                return (
                    <li key={step.status} aria-current={active ? "step" : undefined} className={`flex items-center ${isLast ? "" : "flex-1"}`}>
                        <span className="flex items-center gap-1.5">
                            <span
                                className={`grid size-5 shrink-0 place-items-center rounded-full text-[10px] font-semibold ${
                                    done || active
                                        ? "bg-teal-600 text-white"
                                        : "border border-stone-300 text-stone-400 dark:border-stone-700"
                                }`}
                            >
                                {done ? <Check size={12} aria-hidden="true" /> : i + 1}
                            </span>
                            <span
                                className={`hidden text-xs sm:inline ${
                                    active
                                        ? "font-semibold text-stone-900 dark:text-stone-50"
                                        : "text-stone-500 dark:text-stone-400"
                                }`}
                            >
                                {step.label}
                            </span>
                            <span className="sr-only">{done ? " (completed)" : active ? " (current)" : ""}</span>
                        </span>
                        {!isLast && (
                            <span
                                aria-hidden="true"
                                className={`mx-2 h-0.5 flex-1 rounded-full ${done ? "bg-teal-600" : "bg-stone-200 dark:bg-stone-700"}`}
                            />
                        )}
                    </li>
                );
            })}
        </ol>
    );
}

export function ApplicationCard({
    application,
    href,
    companyHref,
    onWithdraw
}: {
    application: ApplicationCardData;
    href: string;
    companyHref?: string;
    onWithdraw?: (application: ApplicationCardData) => void;
}) {
    const { job, status } = application;
    const closed = job.status === "CLOSED";

    const tag = "rounded-md border border-stone-300 px-2 py-0.5 text-xs text-stone-700 dark:border-stone-700 dark:text-stone-300";

    return (
        <article className="relative flex gap-4 rounded-lg border border-stone-200 bg-white p-4 transition-colors hover:border-stone-400 dark:border-stone-800 dark:bg-stone-900 dark:hover:border-stone-600">
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
                    <div className="shrink-0">
                        <ApplicationStatusBadge status={status} />
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

                <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Job type and work mode">
                    <li className={tag}>{workModeLabel(job.workMode)}</li>
                    <li className={tag}>{jobTypeLabel(job.jobType)}</li>
                    {closed && (
                        <li className="rounded-md bg-stone-200 px-2 py-0.5 text-xs font-medium text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                            Job closed
                        </li>
                    )}
                </ul>

                <Progress status={status} />

                <div className="mt-3 flex items-center justify-between gap-3">
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                        Applied {timeAgo(application.createdAt)}
                        {application.updatedAt && status !== "APPLIED" && ` · Updated ${timeAgo(application.updatedAt)}`}
                    </p>
                    {onWithdraw && WITHDRAWABLE.has(status) && (
                        <button
                            type="button"
                            onClick={() => onWithdraw(application)}
                            className="relative z-10 rounded-md px-2 py-1 text-xs font-medium text-red-700 cursor-pointer hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-red-700 dark:text-red-400 dark:hover:bg-red-950/40"
                        >
                            Withdraw<span className="sr-only"> application for {job.title}</span>
                        </button>
                    )}
                </div>
            </div>
        </article>
    );
}