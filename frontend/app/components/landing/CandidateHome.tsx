"use client"

import { Me } from "@/lib/auth";
import { ApplicantProfile, useMyProfile } from "@/lib/profile";
import { MyApplicationItem } from "@/lib/types";
import { onboardingFor } from "@/providers/authProvider";
import { dataProvider, queryKeys } from "@/providers/dataProvider";
import { useQuery } from "@tanstack/react-query";
import { Bookmark, Briefcase, Search, User } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";
import { timeAgo } from "../jobs/JobCard";
import { ApplicationStatusBadge } from "../jobs/ApplicationStatusBadge";

const actionCard =
    "flex items-center gap-3 rounded-xl border border-stone-200 bg-white p-4 text-sm font-medium text-stone-900 hover:border-purple-400 focus-visible:outline-2 focus-visible:outline-purple-600 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-50 dark:hover:border-purple-500";

function Action({ href, icon, label, hint }: { href: string; icon: ReactNode; label: string; hint: string }) {
    return (
        <Link href={href} className={actionCard}>
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200">{icon}</span>
            <span>
                <span className="block">{label}</span>
                <span className="block text-xs font-normal text-stone-500 dark:text-stone-400">{hint}</span>
            </span>
        </Link>
    )
}

function profileChecks(p: ApplicantProfile){
    const fresher = p.totalExpInYears === 0 && p.remainingExpMonths === 0;
    return [
        { label: "Write a short summary", done: Boolean(p.summary) },
        { label: "Add at least 3 skills", done: p.skills.length >= 3 },
        { label: "Add your education", done: p.educations.length > 0 },
        { label: "Add your work experience", done: p.workExperiences.length > 0 || fresher },
        { label: "Upload a resume", done: p.resumes.length > 0 },
        { label: "Add salary and notice period", done: p.expectedSalary != null && p.noticePeriodDays != null },
    ]
}

export function CandidateHome({ me }: { me: Me }){
    const profile = useMyProfile(me.hasProfile)
    const applications = useQuery({
        queryKey: queryKeys.applications.mine(1, 3),
        queryFn: () => dataProvider.listMyApplications<MyApplicationItem>(1, 3),
        enabled: me.hasProfile
    });

    const checks = profile.data ? profileChecks(profile.data) : null;
    const done = checks ? checks.filter((c) => c.done).length : 0;
    const percent = checks ? Math.round((done / checks.length) * 100) : 0;
    const missing = checks?.filter((c) => !c.done).slice(0, 3) ?? [];

    const items = applications.data?.items ?? [];

    return (
        <div className="mx-auto max-w-5xl space-y-8 px-4 py-10 sm:px-6">
            <header>
                <h1 className="text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
                    Welcome back, {me.firstName}
                </h1>
                <p className="mt-1 text-stone-600 dark:text-stone-400">Here&apos;s where things stand.</p>
            </header>

            {!me.hasProfile && (
                <section role="status" className="rounded-xl border border-purple-300 bg-purple-50 p-5 dark:border-purple-800 dark:bg-purple-950/40">
                    <h2 className="font-semibold text-stone-900 dark:text-stone-50">Finish setting up your profile</h2>
                    <p className="mt-1 text-sm text-stone-700 dark:text-stone-300">
                        Recruiters see your profile when you apply, so it only takes a few minutes to get started.
                    </p>
                    <Link href={onboardingFor(me.role)} className="mt-4 inline-block rounded-md bg-purple-700 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-800">
                        Continue setup
                    </Link>
                </section>
            )}

            <section aria-label="Quick actions" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Action href="/jobs" icon={<Search size={20} aria-hidden="true" />} label="Browse jobs" hint="Search and filter" />
                <Action href="/saved-jobs" icon={<Bookmark size={20} aria-hidden="true" />} label="Saved jobs" hint="Jobs you kept" />
                <Action href="/applied-jobs" icon={<Briefcase size={20} aria-hidden="true" />} label="Applied jobs" hint="Track your status" />
                <Action href="/candidate/profile" icon={<User size={20} aria-hidden="true" />} label="My profile" hint="View and edit" />
            </section>

            {me.hasProfile && (
                <div className="grid gap-6 md:grid-cols-[1fr_20rem]">
                    <section aria-labelledby="recent" className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <h2 id="recent" className="text-lg font-semibold text-stone-900 dark:text-stone-50">Your applications</h2>
                            {items.length > 0 && (
                                <Link href="/applied-jobs" className="text-sm font-medium text-purple-700 hover:underline dark:text-purple-400">See all</Link>
                            )}
                        </div>

                        {applications.isPending ? (
                            <div className="space-y-3" role="status">
                                {[0, 1].map((i) => <div key={i} className="h-14 animate-pulse rounded-lg bg-stone-100 dark:bg-stone-800" />)}
                                <span className="sr-only">Loading</span>
                            </div>
                        ) : items.length === 0 ? (
                            <div className="space-y-3 text-sm text-stone-600 dark:text-stone-400">
                                <p>You haven&apos;t applied to any jobs yet.</p>
                                <Link href="/jobs" className="inline-block font-medium text-purple-700 hover:underline dark:text-purple-400">Find your first job</Link>
                            </div>
                        ) : (
                            <ul className="divide-y divide-stone-200 dark:divide-stone-800">
                                {items.map((a) => (
                                    <li key={a.id} className="flex items-center justify-between gap-3 py-3">
                                        <div className="min-w-0">
                                            <Link href={`/jobs/${a.job.id}`} className="block truncate text-sm font-medium text-stone-900 hover:underline dark:text-stone-50">{a.job.title}</Link>
                                            <p className="truncate text-xs text-stone-500 dark:text-stone-400">{a.job.company.name} · Applied {timeAgo(a.createdAt)}</p>
                                        </div>
                                        <ApplicationStatusBadge status={a.status} />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>

                    {checks && (
                        <section aria-labelledby="strength" className="h-fit rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
                            <h2 id="strength" className="text-lg font-semibold text-stone-900 dark:text-stone-50">Profile strength</h2>
                            <div className="mt-3 h-2 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-700" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label="Profile strength">
                                <div className="h-full rounded-full bg-purple-600 transition-all" style={{ width: `${percent}%` }} />
                            </div>
                            <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">{percent}% complete</p>
                            {missing.length > 0 ? (
                                <ul className="mt-3 space-y-1.5 text-sm">
                                    {missing.map((m) => (
                                        <li key={m.label}>
                                            <Link href="/candidate/profile/edit" className="text-purple-700 hover:underline dark:text-purple-400">{m.label}</Link>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="mt-3 text-sm text-green-700 dark:text-green-400">Your profile is complete.</p>
                            )}
                        </section>
                    )}
                </div>
            )}
        </div>
    );
}