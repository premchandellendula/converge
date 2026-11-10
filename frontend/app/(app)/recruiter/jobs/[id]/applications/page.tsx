"use client";

// Place at: app/(app)/recruiter/jobs/[id]/applications/page.tsx
//   ->  /recruiter/jobs/12/applications

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { dataProvider, queryKeys } from "@/providers/dataProvider";
import { friendlyMessage } from "@/lib/notify";
import { PAGE_SIZE } from "@/lib/jobFilters";
import { Pagination } from "@/app/components/pagination";
import { inputClass, secondaryButton } from "@/app/components/ui";
import { ApplicationStatusTabs, TabKey } from "@/app/components/recruiter/applications/ApplicationStatusTabs";
import { applicationKeys, ApplicationRow } from "@/lib/applications";
import { ApplicantRow } from "@/app/components/recruiter/applications/ApplicantRow";


export default function JobApplicationsPage() {
    const params = useParams<{ id: string }>();
    const jobId = Number(params.id);
    const validId = Number.isInteger(jobId) && jobId > 0;

    const [tab, setTab] = useState<TabKey>("ALL");
    const [page, setPage] = useState(1);
    const [text, setText] = useState("");
    const [q, setQ] = useState("");

    // Wait until the person stops typing before searching.
    useEffect(() => {
        const id = setTimeout(() => {
            if (text.trim() !== q) {
                setQ(text.trim());
                setPage(1);
            }
        }, 400);
        return () => clearTimeout(id);
    }, [text, q]);

    // Shares its cache with the public job page.
    const job = useQuery({
        queryKey: queryKeys.jobs.detail(jobId),
        queryFn: async () => (await dataProvider.getOne<{ title: string }>("jobs", jobId)).data,
        enabled: validId,
    });

    // GET /recruiters/postings/:jobId/applications/counts  ->  { ALL, APPLIED, SHORTLISTED, ... }
    const counts = useQuery({
        queryKey: applicationKeys.counts(jobId),
        queryFn: async () => (await dataProvider.getOne<Record<string, number>>(`recruiters/postings/${jobId}/applications`, "counts")).data,
        enabled: validId,
    });

    // GET /recruiters/postings/:jobId/applications?status=&q=&page=&limit=
    const applications = useQuery({
        queryKey: applicationKeys.list(jobId, tab, q, page),
        queryFn: () =>
            dataProvider.getList<ApplicationRow>(`recruiters/postings/${jobId}/applications`, {
                page,
                limit: PAGE_SIZE,
                status: tab === "ALL" ? undefined : tab,
                q: q || undefined,
            }),
        enabled: validId,
        placeholderData: keepPreviousData,
    });

    const items = applications.data?.data ?? [];
    const total = applications.data?.total ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    const back = (
        <Link href="/recruiter/jobs" className="inline-flex items-center gap-1 text-sm font-medium text-purple-700 hover:underline dark:text-purple-400">
            <ArrowLeft size={16} aria-hidden="true" /> Back to my jobs
        </Link>
    );

    if (!validId) {
        return (
            <main className="mx-auto w-full max-w-4xl space-y-4 p-6">
                {back}
                <p role="alert" className="text-stone-700 dark:text-stone-300">This link isn&apos;t valid.</p>
            </main>
        );
    }

    return (
        <main className="mx-auto w-full max-w-4xl space-y-4 p-6">
            {back}

            <div>
                <h1 className="text-2xl font-semibold text-stone-900 dark:text-stone-50">Applicants</h1>
                {job.data && <p className="text-sm text-stone-600 dark:text-stone-400">{job.data.title}</p>}
            </div>

            <ApplicationStatusTabs
                active={tab}
                counts={counts.data}
                onChange={(next) => {
                    setTab(next);
                    setPage(1);
                }}
            />

            <div>
                <label htmlFor="applicant-search" className="sr-only">Search applicants by name or skill</label>
                <input
                    id="applicant-search"
                    type="search"
                    className={`${inputClass} mt-0`}
                    placeholder="Search by name or skill"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />
            </div>

            {applications.isPending ? (
                <div role="status" aria-live="polite" className="space-y-3">
                    {[0, 1, 2].map((i) => (
                        <div key={i} className="h-40 animate-pulse rounded-lg bg-stone-100 dark:bg-stone-800" />
                    ))}
                    <span className="sr-only">Loading applicants</span>
                </div>
            ) : applications.isError ? (
                <div role="alert" className="space-y-3 rounded-lg border border-red-300 p-4 text-sm dark:border-red-900">
                    <p className="text-red-800 dark:text-red-200">{friendlyMessage(applications.error)}</p>
                    <button type="button" className={secondaryButton} onClick={() => applications.refetch()} disabled={applications.isFetching}>
                        {applications.isFetching ? "Trying again…" : "Try again"}
                    </button>
                </div>
            ) : items.length === 0 ? (
                <div className="rounded-lg border border-stone-200 p-8 text-center dark:border-stone-800">
                    <p className="font-medium text-stone-800 dark:text-stone-200">
                        {q || tab !== "ALL" ? "No applicants match this view." : "No one has applied yet."}
                    </p>
                    <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
                        {q || tab !== "ALL" ? "Try another status or clear the search." : "New applications will show up here."}
                    </p>
                </div>
            ) : (
                <>
                    <p aria-live="polite" className="text-sm text-stone-600 dark:text-stone-400">
                        {total} {total === 1 ? "applicant" : "applicants"}
                        {applications.isFetching && " · updating…"}
                    </p>
                    <ul className={`space-y-3 transition-opacity ${applications.isFetching ? "opacity-60" : ""}`}>
                        {items.map((a) => (
                            <li key={a.id}>
                                <ApplicantRow application={a} href={`/recruiter/jobs/${jobId}/applications/${a.id}`} />
                            </li>
                        ))}
                    </ul>
                    <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
                </>
            )}
        </main>
    );
}