"use client";

import { WITHDRAWABLE } from "@/app/components/application/ApplicationCard";
import { WithdrawDialog } from "@/app/components/dialog/WithdrawDialog";
import { ApplicationStatusBadge } from "@/app/components/jobs/ApplicationStatusBadge";
import { formatExperience, formatSalary, jobTypeLabel, timeAgo, workModeLabel } from "@/app/components/jobs/JobCard";
import { ReportDialog, ReportPayload } from "@/app/components/jobs/ReportDialog";
import { primaryButton, secondaryButton } from "@/app/components/ui";
import { useAppliedJobIds, useSavedJobIds, useToggleSave } from "@/hooks/useJobActions";
import { useMe } from "@/lib/auth";
import { friendlyMessage } from "@/lib/notify";
import { JobListItem } from "@/lib/types";
import { dataProvider, HttpError, queryKeys } from "@/providers/dataProvider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Bookmark, BookmarkCheck, CheckCircle2, Clock, Flag, MapPin, Share2, Users } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const SUPPORTS_REPORT = false;

interface JobDetail extends JobListItem {
    description: string;
    openings: number;
    status: "OPEN" | "CLOSED";
    expiresAt: string | null;
    updatedAt: string;
}

const chip = "rounded-md bg-stone-100 px-2 py-1 text-xs font-medium text-stone-700 dark:bg-stone-800 dark:text-stone-300";

export default function JobDetailPage(){
    const params = useParams<{ id: string }>();
    const jobId = Number(params.id);
    const validId = Number.isInteger(jobId) && jobId > 0;

    const queryClient = useQueryClient();
    const { data: me } = useMe();
    const isCandidate = me?.role === "Candidate";

    const [reportOpen, setReportOpen] = useState(false);
    const [withdrawOpen, setWithdrawOpen] = useState(false);

    const savedIds = useSavedJobIds(isCandidate);
    const appliedIds = useAppliedJobIds(isCandidate);
    const toggleSave = useToggleSave();

    const isSaved = savedIds.data?.has(jobId) ?? false;
    const application = appliedIds.data?.get(jobId);   // { id, status } or undefined
    const isApplied = application !== undefined;

    const job = useQuery({
        queryKey: queryKeys.jobs.detail(jobId),
        queryFn: async () => (await dataProvider.getOne<JobDetail>("jobs", jobId)).data,
        enabled: validId
    })

    const apply = useMutation<unknown, HttpError, void>({
        mutationFn: (body) => dataProvider.create(`applicants/jobs/${jobId}/applications`, { data: {}}),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: queryKeys.applications.all });
            toast.success("Application sent");
        },
        onError: (error) => {
            if (error.status === 409) {
                // already applied: just refresh our state
                void queryClient.invalidateQueries({ queryKey: queryKeys.applications.all });
                toast.info("You've already applied to this job");
            } else {
                toast.error(friendlyMessage(error));
            }
        }
    })

    const withdraw = useMutation<unknown, HttpError, number>({
        mutationFn: (applicationId) => dataProvider.withdrawApplication(applicationId),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: queryKeys.applications.all });
            toast.success("Application withdrawn");
            setWithdrawOpen(false);
        },
    });

    const report = useMutation<unknown, HttpError, ReportPayload>({
        mutationFn: (body) => dataProvider.create(`jobs/${jobId}/report`, { data: body }),
        onSuccess: () => {
            setReportOpen(false);
            toast.success("Thanks, we'll take a look at this job");
        },
        onError: (error) => {
            if (error.status === 409) {
                setReportOpen(false);
                toast.info("You've already reported this job");
            }
        },
    });

    async function share() {
        const url = window.location.href;
        try {
            if (navigator.share) {
                await navigator.share({ title: job.data?.title, url });
            } else {
                await navigator.clipboard.writeText(url);
                toast.success("Link copied");
            }
        } catch {
            // the person closed the share sheet, nothing to do
        }
    }

    const back = (
        <Link href={"/jobs"} className="inline-flex items-center gap-1 text-sm font-medium text-purple-700 hover:underline dark:text-purple-400">
            <ArrowLeft size={16} aria-hidden="true" /> Back to jobs
        </Link>
    )

    if(!validId){
        return (
            <main className="mx-auto w-full max-w-5xl space-y-4 p-6">
                {back}
                <p role="alert" className="text-stone-700 dark:text-stone-300">This job link isn&apos;t valid.</p>
            </main>
        );
    }

    if (job.isPending) {
        return (
            <main className="mx-auto w-full max-w-5xl space-y-4 p-6">
                {back}
                <div role="status" aria-live="polite" className="space-y-3">
                    <div className="h-32 animate-pulse rounded-xl bg-stone-100 dark:bg-stone-800" />
                    <div className="h-64 animate-pulse rounded-xl bg-stone-100 dark:bg-stone-800" />
                    <span className="sr-only">Loading job</span>
                </div>
            </main>
        );
    }

    if (job.isError) {
        const notFound = (job.error as { status?: number } | null)?.status === 404;
        return (
            <main className="mx-auto w-full max-w-5xl space-y-4 p-6">
                {back}
                <div role="alert" className="space-y-3 rounded-lg border border-red-300 p-4 text-sm dark:border-red-900">
                    <p className="text-red-800 dark:text-red-200">
                        {notFound ? "This job doesn't exist or has been removed." : friendlyMessage(job.error)}
                    </p>
                    {!notFound && (
                        <button type="button" className={secondaryButton} onClick={() => job.refetch()} disabled={job.isFetching}>
                            {job.isFetching ? "Trying again…" : "Try again"}
                        </button>
                    )}
                </div>
            </main>
        );
    }

    const j = job.data;
    const closed = j.status === "CLOSED" || (j.expiresAt !== null && new Date(j.expiresAt) < new Date());

    const facts = [
        { label: "Salary", value: formatSalary(j.salaryMin, j.salaryMax, j.currency )},
        { label: "Experience", value: formatExperience(j.experienceMin, j.experienceMax )},
        { label: "Job type", value: jobTypeLabel(j.jobType) },
        { label: "Work mode", value: workModeLabel(j.workMode) },
        { label: "Openings", value: String(j.openings) },
        { label: "Apply before", value: j.expiresAt ? new Date(j.expiresAt).toLocaleDateString() : null }
    ].filter((f): f is { label: string; value: string } => f.value !== null);

    return (
        <main className="mx-auto w-full max-w-5xl space-y-4 p-6">
            {back}

            <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
                <div className="space-y-6">
                    <header className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900 sm:p-6">
                        <div className="flex items-start gap-4">
                            {j.company.logoUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={j.company.logoUrl} alt="" className="size-14 shrink-0 rounded-lg border border-stone-200 object-cover dark:border-stone-700" />
                            ) : (
                                <div aria-hidden="true" className="grid size-14 shrink-0 place-items-center rounded-lg bg-purple-100 text-xl font-semibold text-purple-800 dark:bg-purple-950 dark:text-purple-200">
                                    {j.company.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className="min-w-0 flex-1">
                                <h1 className="text-2xl font-semibold text-stone-900 dark:text-stone-50">{j.title}</h1>
                                <Link href={`/companies/${j.company.id}`} className="text-sm font-medium text-purple-700 hover:underline dark:text-purple-400">
                                    {j.company.name}
                                </Link>
                            </div>
                        </div>

                        <ul className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-stone-600 dark:text-stone-400">
                            <li className="flex items-center gap-1"><MapPin size={15} aria-hidden="true" /> {j.location}</li>
                            <li className="flex items-center gap-1"><Clock size={15} aria-hidden="true" /> Posted {timeAgo(j.createdAt)}</li>
                            <li className="flex items-center gap-1"><Users size={15} aria-hidden="true" /> {j.openings} {j.openings === 1 ? "opening" : "openings"}</li>
                        </ul>

                        {closed && (
                            <p role="status" className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200">
                                This job is no longer accepting applications.
                            </p>
                        )}
                    </header>

                    <section aria-labelledby="job-facts" className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900 sm:p-6">
                        <h2 id="job-facts" className="mb-4 text-lg font-semibold text-stone-900 dark:text-stone-50">Job details</h2>
                        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                            {facts.map((f) => (
                                <div key={f.label}>
                                    <dt className="text-xs text-stone-500 dark:text-stone-400">{f.label}</dt>
                                    <dd className="mt-0.5 text-sm font-medium text-stone-900 dark:text-stone-100">{f.value}</dd>
                                </div>
                            ))}
                        </dl>
                    </section>
                    <section aria-labelledby="job-description" className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900 sm:p-6">
                        <h2 id="job-description" className="mb-3 text-lg font-semibold text-stone-900 dark:text-stone-50">About the role</h2>
                        <p className="whitespace-pre-line wrap-break-word text-sm leading-relaxed text-stone-700 dark:text-stone-300">
                            {j.description}
                        </p>
                    </section>
                    {j.skills.length > 0 && (
                        <section aria-labelledby="job-skills" className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900 sm:p-6">
                            <h2 id="job-skills" className="mb-3 text-lg font-semibold text-stone-900 dark:text-stone-50">Skills</h2>
                            <ul className="flex flex-wrap gap-2">
                                {j.skills.map((s) => (
                                    <li key={s.name} className={chip}>{s.name}</li>
                                ))}
                            </ul>
                        </section>
                    )}
                </div>
                <aside aria-label="Job actions" className="h-fit space-y-3 rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900 lg:sticky lg:top-20">
                    {isCandidate ? (
                        isApplied ? (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between gap-2 rounded-md border border-stone-200 px-3 py-2 text-sm dark:border-stone-700">
                                    <span className="flex items-center gap-2">
                                        <CheckCircle2 size={16} aria-hidden="true" /> You&apos;ve applied
                                    </span>
                                    <ApplicationStatusBadge status={application.status} />
                                </div>
                                {WITHDRAWABLE.has(application.status) && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            withdraw.reset();
                                            setWithdrawOpen(true);
                                        }}
                                        className="w-full rounded-md px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                                    >
                                        Withdraw application
                                    </button>
                                )}
                            </div>
                        ) : closed ? (
                            <button type="button" disabled className={`${primaryButton} w-full`}>Applications closed</button>
                        ) : (
                            <button
                                type="button"
                                className={`${primaryButton} w-full`}
                                onClick={() => apply.mutate()}
                                disabled={apply.isPending}
                            >
                                {apply.isPending ? "Applying…" : "Apply now"}
                            </button>
                        )
                    ) : (
                        <p className="text-sm text-stone-600 dark:text-stone-400">
                            You&apos;re viewing this job as a recruiter, so applying and saving are turned off.
                        </p>
                    )}

                    {isCandidate && (
                        <button
                            type="button"
                            aria-pressed={isSaved}
                            onClick={() => toggleSave.mutate({ jobId, save: !isSaved })}
                            className={`${secondaryButton} flex w-full items-center justify-center gap-2`}
                        >
                            {isSaved ? <BookmarkCheck size={16} aria-hidden="true" /> : <Bookmark size={16} aria-hidden="true" />}
                            {isSaved ? "Saved" : "Save job"}
                        </button>
                    )}

                    <button type="button" onClick={share} className={`${secondaryButton} flex w-full items-center justify-center gap-2`}>
                        <Share2 size={16} aria-hidden="true" /> Share
                    </button>

                    {SUPPORTS_REPORT && (
                        <button
                            type="button"
                            onClick={() => {
                                report.reset();
                                setReportOpen(true);
                            }}
                            className="flex w-full items-center justify-center gap-2 rounded-md px-3 py-2 text-sm text-stone-600 hover:bg-stone-100 hover:text-red-700 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-red-400"
                        >
                            <Flag size={15} aria-hidden="true" /> Report this job
                        </button>
                    )}
                </aside>
            </div>

            {SUPPORTS_REPORT && (
                <ReportDialog
                    open={reportOpen}
                    onClose={() => setReportOpen(false)}
                    isPending={report.isPending}
                    error={report.error && report.error.status !== 409 ? report.error : null}
                    onSubmit={(payload) => report.mutate(payload)}
                />
            )}
            {application && (
                <WithdrawDialog
                    open={withdrawOpen}
                    onClose={() => setWithdrawOpen(false)}
                    jobTitle={j.title}
                    companyName={j.company.name}
                    isPending={withdraw.isPending}
                    error={withdraw.error}
                    onConfirm={() => withdraw.mutate(application.id)}
                />
            )}
        </main>
    )
}