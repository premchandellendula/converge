"use client";

import Link from "next/link";
import { FileText } from "lucide-react";
import { EDUCATION_LEVELS } from "@/app/components/onboarding/draft";
import { formatSalary, timeAgo } from "@/app/components/jobs/JobCard";
import { ApplicationStatusBadge } from "@/app/components/jobs/ApplicationStatusBadge";
import { ApplicationActions } from "./ApplicationActions";
import { ApplicationRow, experienceLabel, fullName, STATUS_LABEL } from "@/lib/applications";


const levelLabel = (v: string) => EDUCATION_LEVELS.find((l) => l.value === v)?.label ?? v;
const chip = "rounded-md border border-stone-300 px-2 py-0.5 text-xs text-stone-700 dark:border-stone-700 dark:text-stone-300";

export function ApplicantRow({ application: a, href }: { application: ApplicationRow; href: string }) {
    const name = fullName(a.applicant.user);
    const { applicant } = a;
    const expected =
        applicant.expectedSalary != null ? formatSalary(applicant.expectedSalary, applicant.expectedSalary, applicant.currency) : null;
    const notice =
        applicant.noticePeriodDays == null ? null : applicant.noticePeriodDays === 0 ? "Immediate joiner" : `${applicant.noticePeriodDays} days notice`;
    const withdrawn = a.status === "WITHDRAWN";

    return (
        <article className={`relative flex gap-4 rounded-lg border border-stone-200 bg-white p-4 transition-colors hover:border-stone-400 dark:border-stone-800 dark:bg-stone-900 dark:hover:border-stone-600 ${withdrawn ? "opacity-70" : ""}`}>
            <div aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-full bg-purple-100 text-base font-semibold text-purple-800 dark:bg-purple-950 dark:text-purple-200">
                {(applicant.user.firstName || "?").charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0 flex-1 space-y-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <h3 className="truncate text-base font-semibold text-stone-900 dark:text-stone-50">
                            <Link href={href} className="outline-none after:absolute after:inset-0 after:rounded-lg focus-visible:after:outline-2 focus-visible:after:outline-purple-600">
                                {name || "Candidate"}
                            </Link>
                        </h3>
                        <p className="truncate text-sm text-stone-600 dark:text-stone-400">
                            {applicant.currentRole
                                ? `${applicant.currentRole.title} at ${applicant.currentRole.companyName}`
                                : "Fresher"}
                            {applicant.location ? ` · ${applicant.location}` : ""}
                        </p>
                    </div>
                    <ApplicationStatusBadge status={a.status} label={STATUS_LABEL[a.status]} />
                </div>

                <ul className="flex flex-wrap gap-1.5" aria-label="Candidate summary">
                    <li className={chip}>{experienceLabel(applicant.totalExpInYears, applicant.remainingExpMonths)}</li>
                    {expected && <li className={chip}>Expects {expected}</li>}
                    {notice && <li className={chip}>{notice}</li>}
                    {applicant.education && (
                        <li className={chip}>{levelLabel(applicant.education.level)}, {applicant.education.institution}</li>
                    )}
                </ul>

                {a.requiredSkillCount > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                        <span className={`font-medium ${a.matchedSkills.length === a.requiredSkillCount ? "text-green-700 dark:text-green-400" : "text-stone-700 dark:text-stone-300"}`}>
                            {a.matchedSkills.length} of {a.requiredSkillCount} skills match
                        </span>
                        {a.matchedSkills.slice(0, 4).map((s) => (
                            <span key={s} className="rounded-md bg-purple-50 px-2 py-0.5 text-purple-900 dark:bg-purple-950 dark:text-purple-200">{s}</span>
                        ))}
                        {a.matchedSkills.length > 4 && <span className="text-stone-500">+{a.matchedSkills.length - 4} more</span>}
                    </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="flex items-center gap-3 text-xs text-stone-500 dark:text-stone-400">
                        <span>Applied {timeAgo(a.createdAt)}</span>
                        {a.hasResume && (
                            <span className="flex items-center gap-1">
                                <FileText size={13} aria-hidden="true" /> Resume
                            </span>
                        )}
                    </p>
                    <ApplicationActions id={a.id} status={a.status} name={name || "candidate"} />
                </div>
            </div>
        </article>
    );
}