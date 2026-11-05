"use client";

// Place at: app/(app)/(candidate)/candidate/profile/page.tsx   ->  /candidate/profile

import Link from "next/link";
import { ReactNode } from "react";
import { friendlyMessage } from "@/lib/notify";
import { primaryButton, secondaryButton } from "@/app/components/ui";
import { EDUCATION_LEVELS } from "@/app/components/onboarding/draft";
import { formatSalary } from "@/app/components/jobs/JobCard";
import { useMe } from "@/lib/auth";
import { ApplicantProfile, useMyProfile } from "@/lib/profile";

const chip = "rounded-md bg-stone-100 px-2 py-1 text-xs font-medium text-stone-700 dark:bg-stone-800 dark:text-stone-300";
const EDIT = "/candidate/profile/edit";

// Dates are stored without a time zone, so read them as UTC to avoid showing the wrong month.
const month = (iso: string) => new Date(iso).toLocaleDateString("en", { month: "short", year: "numeric", timeZone: "UTC" });
const levelLabel = (v: string) => EDUCATION_LEVELS.find((l) => l.value === v)?.label ?? v;

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
    return (
        <section
            aria-labelledby={id}
            className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900 sm:p-6"
        >
            <div className="mb-4 flex items-center justify-between gap-3">
                <h2 id={id} className="text-lg font-semibold text-stone-900 dark:text-stone-50">{title}</h2>
                <Link href={EDIT} className="text-sm font-medium text-purple-700 hover:underline dark:text-purple-400">
                    Edit<span className="sr-only"> {title}</span>
                </Link>
            </div>
            {children}
        </section>
    );
}

const Empty = ({ children }: { children: ReactNode }) => (
    <p className="text-sm text-stone-500 dark:text-stone-400">{children}</p>
);

function Fact({ label, value }: { label: string; value: string | null }) {
    if (!value) return null;
    return (
        <div>
            <dt className="text-xs text-stone-500 dark:text-stone-400">{label}</dt>
            <dd className="mt-0.5 text-sm font-medium text-stone-900 dark:text-stone-100">{value}</dd>
        </div>
    );
}

function ProfileView({ p }: { p: ApplicantProfile }) {
    const fullName = `${p.user.firstName} ${p.user.lastName}`;

    const experienceTotal = [
        p.totalExpInYears > 0 ? `${p.totalExpInYears} ${p.totalExpInYears === 1 ? "year" : "years"}` : null,
        p.remainingExpMonths > 0 ? `${p.remainingExpMonths} ${p.remainingExpMonths === 1 ? "month" : "months"}` : null,
    ].filter(Boolean).join(" ");

    const expected = p.expectedSalary != null ? formatSalary(p.expectedSalary, p.expectedSalary, p.currency) : null;
    const current = p.currentSalary != null ? formatSalary(p.currentSalary, p.currentSalary, p.currency) : null;
    const notice =
        p.noticePeriodDays == null ? null : p.noticePeriodDays === 0 ? "Immediately" : `${p.noticePeriodDays} days`;

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
                            {p.user.firstName.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div className="min-w-0 flex-1">
                        <h1 className="truncate text-2xl font-semibold text-stone-900 dark:text-stone-50">{fullName}</h1>
                        <p className="truncate text-sm text-stone-600 dark:text-stone-400">
                            {[p.industry, p.location].filter(Boolean).join(" · ") || "Add your industry and location"}
                        </p>
                        <p className="mt-1 truncate text-sm text-stone-600 dark:text-stone-400">
                            {[p.user.email, p.user.phone].filter(Boolean).join(" · ")}
                        </p>
                    </div>
                    <Link href={EDIT} className={`${primaryButton} shrink-0`}>Edit profile</Link>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                    {p.openToWork && (
                        <span className="rounded-md bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-950 dark:text-green-200">
                            Open to work
                        </span>
                    )}
                    {p.linkedinUrl && (
                        <a href={p.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-purple-700 hover:underline dark:text-purple-400">
                            LinkedIn
                        </a>
                    )}
                    {p.githubUrl && (
                        <a href={p.githubUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-purple-700 hover:underline dark:text-purple-400">
                            GitHub
                        </a>
                    )}
                </div>
            </header>

            <Section id="view-about" title="About">
                {p.summary ? (
                    <p className="whitespace-pre-line break-words text-sm leading-relaxed text-stone-700 dark:text-stone-300">{p.summary}</p>
                ) : (
                    <Empty>Add a short introduction so recruiters know who you are.</Empty>
                )}
            </Section>

            <Section id="view-experience" title="Experience">
                <p className="mb-4 text-sm text-stone-600 dark:text-stone-400">
                    {experienceTotal ? `Total experience: ${experienceTotal}` : "Fresher"}
                </p>
                {p.workExperiences.length === 0 ? (
                    <Empty>No work history added yet.</Empty>
                ) : (
                    <ol className="space-y-5">
                        {p.workExperiences.map((x) => (
                            <li key={x.id} className="border-l-2 border-stone-200 pl-4 dark:border-stone-700">
                                <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-50">{x.title}</h3>
                                <p className="text-sm text-stone-700 dark:text-stone-300">
                                    {x.companyName}{x.location ? ` · ${x.location}` : ""}
                                </p>
                                <p className="text-xs text-stone-500 dark:text-stone-400">
                                    {month(x.startDate)} – {x.isCurrent || !x.endDate ? "Present" : month(x.endDate)}
                                </p>
                                {x.description && (
                                    <p className="mt-2 whitespace-pre-line break-words text-sm text-stone-700 dark:text-stone-300">{x.description}</p>
                                )}
                            </li>
                        ))}
                    </ol>
                )}
            </Section>

            <Section id="view-education" title="Education">
                {p.educations.length === 0 ? (
                    <Empty>No education added yet.</Empty>
                ) : (
                    <ul className="space-y-4">
                        {p.educations.map((e) => {
                            const years = [e.startYear, e.endYear].filter(Boolean).join(" – ");
                            const score =
                                e.score == null ? null : `${Number(e.score)}${e.scoreType === "CGPA" ? " CGPA" : "%"}`;
                            return (
                                <li key={e.id}>
                                    <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-50">{e.institution}</h3>
                                    <p className="text-sm text-stone-700 dark:text-stone-300">
                                        {[levelLabel(e.level), e.course].filter(Boolean).join(" · ")}
                                    </p>
                                    <p className="text-xs text-stone-500 dark:text-stone-400">
                                        {[years, score].filter(Boolean).join(" · ")}
                                    </p>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </Section>

            <Section id="view-skills" title="Skills">
                {p.skills.length === 0 ? (
                    <Empty>No skills added yet.</Empty>
                ) : (
                    <ul className="flex flex-wrap gap-2">
                        {p.skills.map((s) => (
                            <li key={s.name} className={chip}>{s.name}</li>
                        ))}
                    </ul>
                )}
            </Section>

            <Section id="view-preferences" title="Job preferences">
                <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    <Fact label="Expected salary" value={expected} />
                    <Fact label="Current salary" value={current} />
                    <Fact label="Notice period" value={notice} />
                    <Fact label="Willing to relocate" value={p.willingToRelocate ? "Yes" : "No"} />
                    <Fact label="Preferred locations" value={p.preferredLocations.join(", ") || null} />
                </dl>
                {!expected && !current && !notice && p.preferredLocations.length === 0 && (
                    <Empty>Add your salary expectations and preferred locations to get better matches.</Empty>
                )}
            </Section>

            <Section id="view-resumes" title="Resume">
                {p.resumes.length === 0 ? (
                    <Empty>No resume uploaded. It&apos;s optional, but recruiters can download it with your profile.</Empty>
                ) : (
                    <ul className="space-y-2 text-sm">
                        {p.resumes.map((r) => (
                            <li key={r.id} className="flex items-center justify-between gap-3">
                                <span className="truncate text-stone-800 dark:text-stone-200">{r.fileName}</span>
                                <span className="shrink-0 text-xs text-stone-500 dark:text-stone-400">
                                    Uploaded {new Date(r.uploadedAt).toLocaleDateString()}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </Section>
        </main>
    );
}

export default function ProfilePage() {
    const profile = useMyProfile();
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

    // If the profile response has no user details, fall back to the logged-in user's name and email.
    const p = profile.data;
    const user = p.user.firstName
        ? p.user
        : { firstName: me?.firstName ?? "", lastName: me?.lastName ?? "", email: me?.email ?? "", phone: null, avatarUrl: null };

    return <ProfileView p={{ ...p, user }} />;
}