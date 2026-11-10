"use client";

// Place at: app/(app)/recruiter/jobs/page.tsx   ->  /recruiter/jobs   (the list of MY jobs)

import Link from "next/link";
import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { dataProvider, queryKeys } from "@/providers/dataProvider";
import { friendlyMessage } from "@/lib/notify";
import { PAGE_SIZE } from "@/lib/jobFilters";
import { Pagination } from "@/app/components/pagination";
import { primaryButton, secondaryButton } from "@/app/components/ui";
import { JobPostingCard, JobPostingItem } from "@/app/components/recruiter/applications/JobPostingCard";

export default function MyJobsPage() {
    const [page, setPage] = useState(1);

    // GET /recruiters/postings?page=&limit=   (your getMyPostings route)
    const postings = useQuery({
        queryKey: queryKeys.recruiter.postings(page, PAGE_SIZE),
        queryFn: () => dataProvider.getList<JobPostingItem>("recruiters/postings", { page, limit: PAGE_SIZE }),
        placeholderData: keepPreviousData,
    });

    const items = postings.data?.data ?? [];
    const total = postings.data?.total ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    return (
        <main className="mx-auto w-full max-w-4xl space-y-4 p-6">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold text-stone-900 dark:text-stone-50">My jobs</h1>
                    {!postings.isPending && !postings.isError && total > 0 && (
                        <p aria-live="polite" className="text-sm text-stone-600 dark:text-stone-400">
                            {total} {total === 1 ? "job" : "jobs"}
                            {postings.isFetching && " · updating…"}
                        </p>
                    )}
                </div>
                <Link href="/recruiter/jobs/new" className={primaryButton}>Post a job</Link>
            </div>

            {postings.isPending ? (
                <div role="status" aria-live="polite" className="space-y-3">
                    {[0, 1, 2].map((i) => (
                        <div key={i} className="h-40 animate-pulse rounded-lg bg-stone-100 dark:bg-stone-800" />
                    ))}
                    <span className="sr-only">Loading your jobs</span>
                </div>
            ) : postings.isError ? (
                <div role="alert" className="space-y-3 rounded-lg border border-red-300 p-4 text-sm dark:border-red-900">
                    <p className="text-red-800 dark:text-red-200">{friendlyMessage(postings.error)}</p>
                    <button type="button" className={secondaryButton} onClick={() => postings.refetch()} disabled={postings.isFetching}>
                        {postings.isFetching ? "Trying again…" : "Try again"}
                    </button>
                </div>
            ) : items.length === 0 ? (
                <div className="space-y-3 rounded-lg border border-stone-200 p-8 text-center dark:border-stone-800">
                    <p className="font-medium text-stone-800 dark:text-stone-200">You haven&apos;t posted any jobs yet.</p>
                    <p className="text-sm text-stone-600 dark:text-stone-400">Post your first job and candidates can start applying.</p>
                    <Link href="/recruiter/jobs/new" className={`${primaryButton} inline-block`}>Post a job</Link>
                </div>
            ) : (
                <>
                    <ul className={`space-y-3 transition-opacity ${postings.isFetching ? "opacity-60" : ""}`}>
                        {items.map((job) => (
                            <li key={job.id}>
                                <JobPostingCard job={job} />
                            </li>
                        ))}
                    </ul>
                    <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
                </>
            )}
        </main>
    );
}