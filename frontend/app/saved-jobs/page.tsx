"use client";

import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { dataProvider, queryKeys } from "@/providers/dataProvider";
import { SavedJobItem } from "@/lib/types";
import { PAGE_SIZE } from "@/lib/jobFilters";
import { JobCard, timeAgo } from "@/app/components/jobs/JobCard";
import { useAppliedJobIds, useToggleSave } from "@/hooks/useJobActions";
import { CollectionShell } from "../components/jobs/CollectionShell";

export default function SavedJobsPage() {
    const [page, setPage] = useState(1);

    const saved = useQuery({
        queryKey: queryKeys.savedJobs.list(page, PAGE_SIZE),
        queryFn: () => dataProvider.listSavedJobs<SavedJobItem>({ page, limit: PAGE_SIZE }),
        placeholderData: keepPreviousData,
    });

    const appliedIds = useAppliedJobIds(true);
    const toggleSave = useToggleSave(); // unsaving refreshes this list automatically

    const items = saved.data?.items ?? [];
    const total = saved.data?.count ?? 0;

    return (
        <CollectionShell
            title="Saved jobs"
            query={saved}
            total={total}
            page={page}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            emptyTitle="You haven't saved any jobs yet."
            emptyHint="Tap the bookmark on a job to keep it here for later."
        >
            <ul className="space-y-4">
                {items.map((item) => (
                    <li key={item.job.id}>
                        <JobCard
                            job={item.job}
                            href={`/jobs/${item.job.id}`}
                            companyHref={`/companies/${item.job.company.id}`}
                            isSaved
                            isApplied={appliedIds.data?.has(item.job.id) ?? false}
                            onToggleSave={(jobId, next) => toggleSave.mutate({ jobId, save: next }, {
                                onSuccess: () => {
                                    if(!next && items.length === 1 && page > 1) setPage(page - 1)
                                }
                            })}
                        />
                        <p className="mt-2 px-1 text-sm text-stone-600 dark:text-stone-400">
                            Saved {timeAgo(item.savedAt)}
                        </p>
                    </li>
                ))}
            </ul>
        </CollectionShell>
    );
}