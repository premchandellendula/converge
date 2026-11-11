"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Briefcase, SquarePlus, User } from "lucide-react";
import { Me } from "@/lib/auth";
import { dataProvider, queryKeys } from "@/providers/dataProvider";
import { onboardingFor } from "@/providers/authProvider";
import { useRecruiterProfile } from "@/lib/recruiterProfile";
import { timeAgo } from "@/app/components/jobs/JobCard";
import { JobPostingItem } from "../recruiter/applications/JobPostingCard";

const actionCard =
    "flex items-center gap-3 rounded-xl border border-stone-200 bg-white p-4 text-sm font-medium text-stone-900 hover:border-purple-400 focus-visible:outline-2 focus-visible:outline-purple-600 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-50 dark:hover:border-purple-500";

function Action({ href, icon, label, hint, primary }: { href: string; icon: ReactNode; label: string; hint: string; primary?: boolean }) {
    return (
        <Link href={href} className={primary ? `${actionCard} border-purple-600 bg-purple-700 text-white hover:border-purple-800 hover:bg-purple-800 dark:border-purple-600 dark:bg-purple-700 dark:text-white` : actionCard}>
            <span className={`grid size-10 shrink-0 place-items-center rounded-lg ${primary ? "bg-white/20 text-white" : "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200"}`}>{icon}</span>
            <span>
                <span className="block">{label}</span>
                <span className={`block text-xs font-normal ${primary ? "text-purple-100" : "text-stone-500 dark:text-stone-400"}`}>{hint}</span>
            </span>
        </Link>
    );
}

export function RecruiterHome({ me }: { me: Me }) {
    const profile = useRecruiterProfile(me.hasProfile);
    const postings = useQuery({
        queryKey: queryKeys.recruiter.postings(1, 3),
        queryFn: () => dataProvider.getList<JobPostingItem>("recruiters/postings", { page: 1, limit: 3 }),
        enabled: me.hasProfile,
    });

    const items = postings.data?.data ?? [];
    const total = postings.data?.total ?? 0;
    const company = profile.data?.company?.name;

    return (
        <div className="mx-auto max-w-5xl space-y-8 px-4 py-10 sm:px-6">
            <header>
                <h1 className="text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
                    Welcome back, {me.firstName}
                </h1>
                <p className="mt-1 text-stone-600 dark:text-stone-400">
                    {company ? `Hiring for ${company}.` : "Here's your hiring at a glance."}
                </p>
            </header>

            {!me.hasProfile && (
                <section role="status" className="rounded-xl border border-purple-300 bg-purple-50 p-5 dark:border-purple-800 dark:bg-purple-950/40">
                    <h2 className="font-semibold text-stone-900 dark:text-stone-50">Finish setting up your recruiter profile</h2>
                    <p className="mt-1 text-sm text-stone-700 dark:text-stone-300">Add your details and your company, then you can start posting jobs.</p>
                    <Link href={onboardingFor(me.role)} className="mt-4 inline-block rounded-md bg-purple-700 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-800">
                        Continue setup
                    </Link>
                </section>
            )}

            {me.hasProfile && (
                <>
                    <section aria-label="Quick actions" className="grid gap-4 sm:grid-cols-3">
                        <Action primary href="/recruiter/jobs/new" icon={<SquarePlus size={20} aria-hidden="true" />} label="Post a job" hint="Start receiving applicants" />
                        <Action href="/recruiter/jobs" icon={<Briefcase size={20} aria-hidden="true" />} label="My jobs" hint={total > 0 ? `${total} posted` : "Manage your postings"} />
                        <Action href="/recruiter/profile" icon={<User size={20} aria-hidden="true" />} label="My profile" hint="View and edit" />
                    </section>

                    <section aria-labelledby="postings" className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <h2 id="postings" className="text-lg font-semibold text-stone-900 dark:text-stone-50">Recent jobs</h2>
                            {items.length > 0 && (
                                <Link href="/recruiter/jobs" className="text-sm font-medium text-purple-700 hover:underline dark:text-purple-400">See all</Link>
                            )}
                        </div>

                        {postings.isPending ? (
                            <div className="space-y-3" role="status">
                                {[0, 1].map((i) => <div key={i} className="h-14 animate-pulse rounded-lg bg-stone-100 dark:bg-stone-800" />)}
                                <span className="sr-only">Loading</span>
                            </div>
                        ) : items.length === 0 ? (
                            <div className="space-y-3 text-sm text-stone-600 dark:text-stone-400">
                                <p>You haven&apos;t posted any jobs yet.</p>
                                <Link href="/recruiter/jobs/new" className="inline-block font-medium text-purple-700 hover:underline dark:text-purple-400">Post your first job</Link>
                            </div>
                        ) : (
                            <ul className="divide-y divide-stone-200 dark:divide-stone-800">
                                {items.map((job) => (
                                    <li key={job.id} className="flex items-center justify-between gap-3 py-3">
                                        <div className="min-w-0">
                                            <Link href={`/recruiter/jobs/${job.id}/applications`} className="block truncate text-sm font-medium text-stone-900 hover:underline dark:text-stone-50">{job.title}</Link>
                                            <p className="truncate text-xs text-stone-500 dark:text-stone-400">Posted {timeAgo(job.createdAt)} · {job.status === "OPEN" ? "Open" : "Closed"}</p>
                                        </div>
                                        <Link href={`/recruiter/jobs/${job.id}/applications`} className="shrink-0 rounded-md bg-stone-100 px-3 py-1.5 text-xs font-medium text-stone-800 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-100 dark:hover:bg-stone-700">
                                            {job._count.applications} {job._count.applications === 1 ? "applicant" : "applicants"}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </>
            )}
        </div>
    );
}