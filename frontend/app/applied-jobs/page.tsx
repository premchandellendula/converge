"use client"

import { useSavedJobIds, useToggleSave } from "@/hooks/useJobActions";
import { PAGE_SIZE } from "@/lib/jobFilters";
import { MyApplicationItem } from "@/lib/types";
import { dataProvider, queryKeys } from "@/providers/dataProvider";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { JobCard, timeAgo } from "../components/jobs/JobCard";
import { CollectionShell } from "../components/jobs/CollectionShell";
import { ApplicationStatusBadge } from "../components/jobs/ApplicationStatusBadge";
import { ApplicationCard } from "../components/application/ApplicationCard";

export default function AppliedJobsPage() {
    const [page, setPage] = useState(1);

    const applications = useQuery({
        queryKey: queryKeys.applications.mine(page, PAGE_SIZE),
        queryFn: () => dataProvider.listMyApplications<MyApplicationItem>(page, PAGE_SIZE),
        placeholderData: keepPreviousData,
    });

    const savedIds = useSavedJobIds(true);
    const toggleSave = useToggleSave();

    const items = applications.data?.items ?? [];
    const total = applications.data?.count ?? 0;

    return (
        <CollectionShell
            title="Applied jobs"
            query={applications}
            total={total}
            page={page}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            emptyTitle="You haven't applied to any jobs yet."
            emptyHint="When you apply, you can follow the status of each application here."
        >
            <ul className="space-y-4">
                {items.map((application) => (
                    <li key={application.id}>
                        <ApplicationCard
                            application={application}
                            href={`/jobs/${application.job.id}`}
                            companyHref={`/companies/${application.job.company.id}`}
                        />
                        <div className="mt-2 flex items-center gap-3 px-1 text-sm text-stone-600 dark:text-stone-400">
                            <ApplicationStatusBadge status={application.status} />
                            <span>Applied {timeAgo(application.createdAt)}</span>
                        </div>
                    </li>
                ))}
            </ul>
        </CollectionShell>
    )
}