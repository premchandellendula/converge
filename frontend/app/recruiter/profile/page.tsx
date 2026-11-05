"use client";

// Place at: app/(app)/recruiter/profile/page.tsx   ->  /recruiter/profile

import Link from "next/link";
import { ReactNode } from "react";
import { friendlyMessage } from "@/lib/notify";
import { primaryButton, secondaryButton } from "@/app/components/ui";
import { useMe } from "@/lib/auth";
import { RecruiterProfile, useRecruiterProfile } from "@/lib/recruiterProfile";

const EDIT = "/recruiter/profile/edit";

const Empty = ({ children }: { children: ReactNode }) => (
    <p className="text-sm text-stone-500 dark:text-stone-400">{children}</p>
);

function Fact({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div>
            <dt className="text-xs text-stone-500 dark:text-stone-400">{label}</dt>
            <dd className="mt-0.5 wrap-break-word text-sm font-medium text-stone-900 dark:text-stone-100">{children}</dd>
        </div>
    );
}

const extLink = "text-purple-700 hover:underline dark:text-purple-400";

function Card({ id, title, action, children }: { id: string; title: string; action?: ReactNode; children: ReactNode }) {
    return (
        <section
            aria-labelledby={id}
            className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900 sm:p-6"
        >
            <div className="mb-4 flex items-center justify-between gap-3">
                <h2 id={id} className="text-lg font-semibold text-stone-900 dark:text-stone-50">{title}</h2>
                {action}
            </div>
            {children}
        </section>
    );
}

function ProfileView({ p }: { p: RecruiterProfile }) {
    const fullName = `${p.user.firstName} ${p.user.lastName}`.trim();
    const company = p.company;
    const isAdmin = p.companyRole === "ADMIN";

    return (
        <main className="mx-auto w-full max-w-3xl space-y-5 p-6">
            {/* Header */}
            <header className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900 sm:p-6">
                <div className="flex items-start gap-4">
                    {p.user.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.user.avatarUrl} alt="" className="size-16 shrink-0 rounded-full object-cover" />
                    ) : (
                        <div aria-hidden="true" className="grid size-16 shrink-0 place-items-center rounded-full bg-purple-600 text-2xl font-semibold text-white">
                            {(p.user.firstName || "?").charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div className="min-w-0 flex-1">
                        <h1 className="truncate text-2xl font-semibold text-stone-900 dark:text-stone-50">{fullName || "Your profile"}</h1>
                        <p className="truncate text-sm text-stone-600 dark:text-stone-400">
                            {[p.designation, p.department].filter(Boolean).join(" · ")}
                        </p>
                        {company && (
                            <p className="truncate text-sm text-stone-600 dark:text-stone-400">at {company.name}</p>
                        )}
                    </div>
                    <Link href={EDIT} className={`${primaryButton} shrink-0`}>Edit profile</Link>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-stone-100 px-2 py-1 text-xs font-medium text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                        {isAdmin ? "Company admin" : "Recruiter"}
                    </span>
                    {p.isVerified && (
                        <span className="rounded-md bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-950 dark:text-green-200">
                            Verified
                        </span>
                    )}
                </div>
            </header>

            <Card id="rec-about" title="About">
                {p.bio ? (
                    <p className="whitespace-pre-line wrap-break-word text-sm leading-relaxed text-stone-700 dark:text-stone-300">{p.bio}</p>
                ) : (
                    <Empty>Add a short introduction so candidates know who they&apos;re talking to.</Empty>
                )}
            </Card>

            <Card id="rec-contact" title="Contact">
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Fact label="Account email">{p.user.email || "-"}</Fact>
                    {p.user.phone && <Fact label="Phone">{p.user.phone}</Fact>}
                    {p.workEmail && <Fact label="Work email">{p.workEmail}</Fact>}
                    {p.linkedinUrl && (
                        <Fact label="LinkedIn">
                            <a href={p.linkedinUrl} target="_blank" rel="noopener noreferrer" className={extLink}>
                                {p.linkedinUrl.replace(/^https?:\/\/(www\.)?/, "")}
                            </a>
                        </Fact>
                    )}
                </dl>
            </Card>

            {company && (
                <Card
                    id="rec-company"
                    title="Company"
                    action={
                        isAdmin ? (
                            <Link href="/recruiter/company" className={`text-sm font-medium ${extLink}`}>
                                Manage<span className="sr-only"> company</span>
                            </Link>
                        ) : undefined
                    }
                >
                    <div className="flex items-start gap-4">
                        {company.logoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={company.logoUrl} alt="" className="size-12 shrink-0 rounded-lg border border-stone-200 object-contain p-1 dark:border-stone-700" />
                        ) : (
                            <div aria-hidden="true" className="grid size-12 shrink-0 place-items-center rounded-lg bg-stone-100 text-lg font-semibold text-stone-600 dark:bg-stone-800 dark:text-stone-300">
                                {company.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className="min-w-0 flex-1 space-y-2">
                            <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-stone-900 dark:text-stone-50">
                                {company.name}
                                {company.isVerified && (
                                    <span className="rounded-md bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-950 dark:text-green-200">
                                        Verified
                                    </span>
                                )}
                            </p>
                            <p className="text-sm text-stone-600 dark:text-stone-400">
                                {[company.headquarters, company.website?.replace(/^https?:\/\/(www\.)?/, "")].filter(Boolean).join(" · ")}
                            </p>
                            {company.description && (
                                <p className="whitespace-pre-line wrap-break-word text-sm text-stone-700 dark:text-stone-300">{company.description}</p>
                            )}
                        </div>
                    </div>
                </Card>
            )}

            <Card
                id="rec-activity"
                title="Activity"
                action={
                    <Link href="/recruiter/jobs" className={`text-sm font-medium ${extLink}`}>
                        My jobs
                    </Link>
                }
            >
                <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {p._count && <Fact label="Jobs posted">{p._count.jobsPosted}</Fact>}
                    <Fact label="Member since">
                        {new Date(p.joinedAt).toLocaleDateString("en", { month: "short", year: "numeric" })}
                    </Fact>
                </dl>
            </Card>
        </main>
    );
}

export default function RecruiterProfilePage() {
    const profile = useRecruiterProfile();
    const { data: me } = useMe();

    if (profile.isPending) {
        return (
            <main className="mx-auto w-full max-w-3xl space-y-4 p-6">
                <div role="status" aria-live="polite" className="space-y-3">
                    <div className="h-36 animate-pulse rounded-xl bg-stone-100 dark:bg-stone-800" />
                    <div className="h-48 animate-pulse rounded-xl bg-stone-100 dark:bg-stone-800" />
                    <span className="sr-only">Loading your profile</span>
                </div>
            </main>
        );
    }

    if (profile.isError) {
        return (
            <main className="mx-auto w-full max-w-3xl p-6">
                <div role="alert" className="space-y-3 rounded-lg border border-red-300 p-4 text-sm dark:border-red-900">
                    <p className="text-red-800 dark:text-red-200">{friendlyMessage(profile.error)}</p>
                    <button type="button" className={secondaryButton} onClick={() => profile.refetch()} disabled={profile.isFetching}>
                        {profile.isFetching ? "Trying again…" : "Try again"}
                    </button>
                </div>
            </main>
        );
    }

    // If the response has no user details, fall back to the logged-in user's name and email.
    const p = profile.data;
    const user = p.user.firstName
        ? p.user
        : { firstName: me?.firstName ?? "", lastName: me?.lastName ?? "", email: me?.email ?? "", phone: null, avatarUrl: null };

    return <ProfileView p={{ ...p, user }} />;
}