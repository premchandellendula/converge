"use client";

// Place at: app/(app)/recruiter/jobs/[id]/applications/[applicationId]/page.tsx
//   ->  /recruiter/jobs/12/applications/345

import Link from "next/link";
import { ReactNode } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, FileText } from "lucide-react";
import { dataProvider, HttpError } from "@/providers/dataProvider";
import { friendlyMessage } from "@/lib/notify";
import { primaryButton, secondaryButton } from "@/app/components/ui";
import { EDUCATION_LEVELS } from "@/app/components/onboarding/draft";
import { formatSalary, timeAgo } from "@/app/components/jobs/JobCard";
import { ApplicationStatusBadge } from "@/app/components/jobs/ApplicationStatusBadge";
import { ApplicationDetail, applicationKeys, experienceLabel, fullName, STATUS_LABEL } from "@/lib/applications";
import { ApplicationActions } from "@/app/components/recruiter/applications/ApplicationActions";

const month = (iso: string) => new Date(iso).toLocaleDateString("en", { month: "short", year: "numeric", timeZone: "UTC" });
const levelLabel = (v: string) => EDUCATION_LEVELS.find((l) => l.value === v)?.label ?? v;
const link = "font-medium text-purple-700 hover:underline dark:text-purple-400";

function Card({ id, title, children }: { id: string; title: string; children: ReactNode }) {
    return (
        <section aria-labelledby={id} className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900 sm:p-6">
            <h2 id={id} className="mb-4 text-lg font-semibold text-stone-900 dark:text-stone-50">{title}</h2>
            {children}
        </section>
    );
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div>
            <dt className="text-xs text-stone-500 dark:text-stone-400">{label}</dt>
            <dd className="mt-0.5 wrap-break-word text-sm font-medium text-stone-900 dark:text-stone-100">{children}</dd>
        </div>
    );
}

export default function ApplicationDetailPage() {
    const params = useParams<{ id: string; applicationId: string }>();
    const jobId = Number(params.id);
    const applicationId = Number(params.applicationId);
    const validId = Number.isInteger(applicationId) && applicationId > 0;
    const listHref = `/recruiter/jobs/${jobId}/applications`;

    // GET /recruiters/applications/:id
    const detail = useQuery({
        queryKey: applicationKeys.detail(applicationId),
        queryFn: async () => (await dataProvider.getOne<ApplicationDetail>("recruiters/applications", applicationId)).data,
        enabled: validId,
    });

    // GET /recruiters/applications/:id/resume  ->  { url }  (a short-lived signed link)
    const resume = useMutation<string | null, HttpError, void>({
        mutationFn: async () =>
            (await dataProvider.getOne<{ url: string }>("recruiters/applications", `${applicationId}/resume`)).data?.url ?? null,
    });

    function openResume() {
        // Open the tab right away (a popup blocker allows it inside the click), then point it at the signed link.
        const tab = window.open("", "_blank");
        resume.mutate(undefined, {
            onSuccess: (url) => {
                if (url && tab) tab.location.href = url;
                else {
                    tab?.close();
                    toast.error("This resume isn't available");
                }
            },
            onError: (error) => {
                tab?.close();
                toast.error(friendlyMessage(error));
            },
        });
    }

    const back = (
        <Link href={listHref} className={`inline-flex items-center gap-1 text-sm ${link}`}>
            <ArrowLeft size={16} aria-hidden="true" /> Back to applicants
        </Link>
    );

    if (!validId) {
        return (
            <main className="mx-auto w-full max-w-3xl space-y-4 p-6">
                {back}
                <p role="alert" className="text-stone-700 dark:text-stone-300">This link isn&apos;t valid.</p>
            </main>
        );
    }

    if (detail.isPending) {
        return (
            <main className="mx-auto w-full max-w-3xl space-y-4 p-6">
                {back}
                <div role="status" aria-live="polite" className="space-y-3">
                    <div className="h-36 animate-pulse rounded-xl bg-stone-100 dark:bg-stone-800" />
                    <div className="h-48 animate-pulse rounded-xl bg-stone-100 dark:bg-stone-800" />
                    <span className="sr-only">Loading application</span>
                </div>
            </main>
        );
    }

    if (detail.isError) {
        const notFound = (detail.error as { status?: number } | null)?.status === 404;
        return (
            <main className="mx-auto w-full max-w-3xl space-y-4 p-6">
                {back}
                <div role="alert" className="space-y-3 rounded-lg border border-red-300 p-4 text-sm dark:border-red-900">
                    <p className="text-red-800 dark:text-red-200">
                        {notFound ? "This application doesn't exist or you don't have access to it." : friendlyMessage(detail.error)}
                    </p>
                    {!notFound && (
                        <button type="button" className={secondaryButton} onClick={() => detail.refetch()} disabled={detail.isFetching}>
                            {detail.isFetching ? "Trying again…" : "Try again"}
                        </button>
                    )}
                </div>
            </main>
        );
    }

    const d = detail.data;
    const a = d.applicant;
    const name = fullName(a.user) || "Candidate";
    const matched = new Set(d.matchedSkills.map((s) => s.toLowerCase()));
    const jobPays = formatSalary(d.job.salaryMin, d.job.salaryMax, d.job.currency);
    const expects = a.expectedSalary != null ? formatSalary(a.expectedSalary, a.expectedSalary, a.currency) : null;
    const notice = a.noticePeriodDays == null ? null : a.noticePeriodDays === 0 ? "Immediately" : `${a.noticePeriodDays} days`;

    return (
        <main className="mx-auto w-full max-w-3xl space-y-5 p-6">
            {back}

            {/* Header */}
            <header className="space-y-4 rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900 sm:p-6">
                <div className="flex items-start gap-4">
                    <div aria-hidden="true" className="grid size-16 shrink-0 place-items-center rounded-full bg-purple-600 text-2xl font-semibold text-white">
                        {name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                        <h1 className="truncate text-2xl font-semibold text-stone-900 dark:text-stone-50">{name}</h1>
                        <p className="truncate text-sm text-stone-600 dark:text-stone-400">
                            {a.workExperiences[0] ? `${a.workExperiences[0].title} at ${a.workExperiences[0].companyName}` : "Fresher"}
                            {a.location ? ` · ${a.location}` : ""}
                        </p>
                        <p className="mt-1 truncate text-sm text-stone-600 dark:text-stone-400">
                            Applied for {d.job.title}
                        </p>
                    </div>
                    <ApplicationStatusBadge status={d.status} label={STATUS_LABEL[d.status]} />
                </div>

                <ApplicationActions id={d.id} status={d.status} name={name} />

                <dl className="grid grid-cols-1 gap-4 border-t border-stone-200 pt-4 dark:border-stone-800 sm:grid-cols-2">
                    <Fact label="Email"><a href={`mailto:${a.user.email}`} className={link}>{a.user.email}</a></Fact>
                    {a.user.phone && <Fact label="Phone"><a href={`tel:${a.user.phone}`} className={link}>{a.user.phone}</a></Fact>}
                    {a.linkedinUrl && (
                        <Fact label="LinkedIn">
                            <a href={a.linkedinUrl} target="_blank" rel="noopener noreferrer" className={link}>{a.linkedinUrl.replace(/^https?:\/\/(www\.)?/, "")}</a>
                        </Fact>
                    )}
                    {a.githubUrl && (
                        <Fact label="GitHub">
                            <a href={a.githubUrl} target="_blank" rel="noopener noreferrer" className={link}>{a.githubUrl.replace(/^https?:\/\/(www\.)?/, "")}</a>
                        </Fact>
                    )}
                </dl>

                <div className="flex flex-wrap items-center gap-3">
                    {d.hasResume ? (
                        <button type="button" className={`${primaryButton} inline-flex items-center gap-2`} onClick={openResume} disabled={resume.isPending}>
                            <FileText size={16} aria-hidden="true" /> {resume.isPending ? "Opening…" : "Open resume"}
                        </button>
                    ) : (
                        <p className="text-sm text-stone-500 dark:text-stone-400">No resume attached.</p>
                    )}
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                        Applied {timeAgo(d.createdAt)}
                        {d.updatedAt !== d.createdAt && ` · Updated ${timeAgo(d.updatedAt)}`}
                    </p>
                </div>
            </header>

            {d.coverLetter && (
                <Card id="app-cover" title="Cover letter">
                    <p className="whitespace-pre-line wrap-break-word text-sm leading-relaxed text-stone-700 dark:text-stone-300">{d.coverLetter}</p>
                </Card>
            )}

            <Card id="app-fit" title="Fit for this job">
                <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    <Fact label="Experience">{experienceLabel(a.totalExpInYears, a.remainingExpMonths)}</Fact>
                    <Fact label="Job pays">{jobPays ?? "Not disclosed"}</Fact>
                    <Fact label="Expects">{expects ?? "Not shared"}</Fact>
                    <Fact label="Notice period">{notice ?? "Not shared"}</Fact>
                    <Fact label="Willing to relocate">{a.willingToRelocate ? "Yes" : "No"}</Fact>
                    {a.preferredLocations.length > 0 && <Fact label="Preferred locations">{a.preferredLocations.join(", ")}</Fact>}
                </dl>
                {d.requiredSkillCount > 0 && (
                    <p className="mt-4 text-sm font-medium text-stone-800 dark:text-stone-200">
                        {d.matchedSkills.length} of {d.requiredSkillCount} required skills match
                    </p>
                )}
            </Card>

            {a.summary && (
                <Card id="app-about" title="About">
                    <p className="whitespace-pre-line wrap-break-word text-sm leading-relaxed text-stone-700 dark:text-stone-300">{a.summary}</p>
                </Card>
            )}

            <Card id="app-experience" title="Experience">
                {a.workExperiences.length === 0 ? (
                    <p className="text-sm text-stone-500 dark:text-stone-400">No work history added.</p>
                ) : (
                    <ol className="space-y-5">
                        {a.workExperiences.map((x) => (
                            <li key={x.id} className="border-l-2 border-stone-200 pl-4 dark:border-stone-700">
                                <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-50">{x.title}</h3>
                                <p className="text-sm text-stone-700 dark:text-stone-300">{x.companyName}{x.location ? ` · ${x.location}` : ""}</p>
                                <p className="text-xs text-stone-500 dark:text-stone-400">
                                    {month(x.startDate)} – {x.isCurrent || !x.endDate ? "Present" : month(x.endDate)}
                                </p>
                                {x.description && <p className="mt-2 whitespace-pre-line wrap-break-word text-sm text-stone-700 dark:text-stone-300">{x.description}</p>}
                            </li>
                        ))}
                    </ol>
                )}
            </Card>

            <Card id="app-education" title="Education">
                {a.educations.length === 0 ? (
                    <p className="text-sm text-stone-500 dark:text-stone-400">No education added.</p>
                ) : (
                    <ul className="space-y-4">
                        {a.educations.map((e) => {
                            const years = [e.startYear, e.endYear].filter(Boolean).join(" – ");
                            const score = e.score == null ? null : `${Number(e.score)}${e.scoreType === "CGPA" ? " CGPA" : "%"}`;
                            return (
                                <li key={e.id}>
                                    <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-50">{e.institution}</h3>
                                    <p className="text-sm text-stone-700 dark:text-stone-300">{[levelLabel(e.level), e.course].filter(Boolean).join(" · ")}</p>
                                    <p className="text-xs text-stone-500 dark:text-stone-400">{[years, score].filter(Boolean).join(" · ")}</p>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </Card>

            <Card id="app-skills" title="Skills">
                {a.skills.length === 0 ? (
                    <p className="text-sm text-stone-500 dark:text-stone-400">No skills added.</p>
                ) : (
                    <ul className="flex flex-wrap gap-2">
                        {a.skills.map((s) => {
                            const isMatch = matched.has(s.name.toLowerCase());
                            return (
                                <li
                                    key={s.name}
                                    className={`rounded-md px-2 py-1 text-xs font-medium ${
                                        isMatch
                                            ? "bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-200"
                                            : "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300"
                                    }`}
                                >
                                    {s.name}
                                    {isMatch && <span className="sr-only"> (matches this job)</span>}
                                </li>
                            );
                        })}
                    </ul>
                )}
                {d.requiredSkillCount > 0 && <p className="mt-3 text-xs text-stone-500 dark:text-stone-400">Highlighted skills match this job.</p>}
            </Card>
        </main>
    );
}