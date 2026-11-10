"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Clock, MapPin, Users } from "lucide-react";
import { dataProvider, HttpError, queryKeys } from "@/providers/dataProvider";
import { friendlyMessage } from "@/lib/notify";
import { primaryButton, secondaryButton } from "@/app/components/ui";
import { jobTypeLabel, timeAgo, workModeLabel } from "@/app/components/jobs/JobCard";
import { Modal } from "@/app/components/jobs/Modal";

export interface JobPostingItem {
    id: number;
    title: string;
    location: string;
    jobType: string;
    workMode: string;
    createdAt: string;
    status: "OPEN" | "CLOSED";
    openings: number;
    expiresAt: string | null;
    _count: { applications: number };
}

const outline =
    "rounded-md border border-stone-300 px-3 py-1.5 text-sm font-medium text-stone-800 hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 disabled:opacity-60 dark:border-stone-700 dark:text-stone-100 dark:hover:bg-stone-800";

export function JobPostingCard({ job }: { job: JobPostingItem }) {
    const queryClient = useQueryClient();
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [now] = useState(() => Date.now()); // read the clock once, so rendering stays predictable

    const expired = job.expiresAt !== null && new Date(job.expiresAt).getTime() < now;
    const state = job.status === "CLOSED" ? "Closed" : expired ? "Expired" : "Open";
    const stateClass =
        state === "Open"
            ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200"
            : "bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300";

    // PATCH /jobs/:id  { status }
    const setStatus = useMutation<unknown, HttpError, "OPEN" | "CLOSED">({
        mutationFn: (status) => dataProvider.update("jobs", { id: job.id, data: { status } }),
        onSuccess: async (_data, status) => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: queryKeys.recruiter.all }),
                queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all }), // the public lists too
            ]);
            toast.success(status === "CLOSED" ? "Job closed" : "Job reopened");
            setConfirmOpen(false);
        },
        onError: (error) => toast.error(friendlyMessage(error)),
    });

    const count = job._count.applications;

    return (
        <article className="rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900 sm:p-5">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold text-stone-900 dark:text-stone-50">
                        <Link href={`/recruiter/jobs/${job.id}/applications`} className="hover:underline focus-visible:outline-2 focus-visible:outline-purple-600">
                            {job.title}
                        </Link>
                    </h3>
                    <ul className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-stone-600 dark:text-stone-400">
                        <li className="flex items-center gap-1"><MapPin size={14} aria-hidden="true" /> {job.location}</li>
                        <li>{workModeLabel(job.workMode)} · {jobTypeLabel(job.jobType)}</li>
                        <li className="flex items-center gap-1"><Clock size={14} aria-hidden="true" /> Posted {timeAgo(job.createdAt)}</li>
                    </ul>
                </div>
                <span className={`shrink-0 rounded-md px-2 py-1 text-xs font-medium ${stateClass}`}>{state}</span>
            </div>

            <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-sm">
                <div>
                    <dt className="text-xs text-stone-500 dark:text-stone-400">Applicants</dt>
                    <dd className="mt-0.5 flex items-center gap-1 font-semibold tabular-nums text-stone-900 dark:text-stone-50">
                        <Users size={14} aria-hidden="true" /> {count}
                    </dd>
                </div>
                <div>
                    <dt className="text-xs text-stone-500 dark:text-stone-400">Openings</dt>
                    <dd className="mt-0.5 font-semibold tabular-nums text-stone-900 dark:text-stone-50">{job.openings}</dd>
                </div>
                {job.expiresAt && (
                    <div>
                        <dt className="text-xs text-stone-500 dark:text-stone-400">{expired ? "Expired on" : "Expires on"}</dt>
                        <dd className="mt-0.5 font-semibold text-stone-900 dark:text-stone-50">
                            {new Date(job.expiresAt).toLocaleDateString()}
                        </dd>
                    </div>
                )}
            </dl>

            <div className="mt-4 flex flex-wrap items-center gap-2">
                <Link href={`/recruiter/jobs/${job.id}/applications`} className={`${primaryButton} text-sm`}>
                    View applicants{count > 0 ? ` (${count})` : ""}
                </Link>
                <Link href={`/jobs/${job.id}`} className={outline}>View job</Link>

                {job.status === "OPEN" && !expired && (
                    <button type="button" className={outline} onClick={() => setConfirmOpen(true)}>Close job</button>
                )}
                {job.status === "CLOSED" && !expired && (
                    <button type="button" className={outline} disabled={setStatus.isPending} onClick={() => setStatus.mutate("OPEN")}>
                        {setStatus.isPending ? "Reopening…" : "Reopen"}
                    </button>
                )}
            </div>

            <Modal open={confirmOpen} onClose={() => !setStatus.isPending && setConfirmOpen(false)} title="Close this job?">
                <div className="space-y-5">
                    <p className="text-sm text-stone-700 dark:text-stone-300">
                        <strong>{job.title}</strong> will stop accepting applications and show as closed to candidates.
                        Existing applications stay in your list, and you can reopen the job later.
                    </p>
                    <div className="flex items-center justify-end gap-3">
                        <button type="button" className={secondaryButton} onClick={() => setConfirmOpen(false)} disabled={setStatus.isPending}>
                            Keep open
                        </button>
                        <button
                            type="button"
                            className="rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 disabled:opacity-60"
                            disabled={setStatus.isPending}
                            onClick={() => setStatus.mutate("CLOSED")}
                        >
                            {setStatus.isPending ? "Closing…" : "Close job"}
                        </button>
                    </div>
                </div>
            </Modal>
        </article>
    );
}