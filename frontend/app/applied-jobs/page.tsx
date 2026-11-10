"use client"

import { PAGE_SIZE } from "@/lib/jobFilters";
import { ApplicationCardData, MyApplicationItem } from "@/lib/types";
import { dataProvider, HttpError, queryKeys } from "@/providers/dataProvider";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { timeAgo } from "../components/jobs/JobCard";
import { CollectionShell } from "../components/jobs/CollectionShell";
import { ApplicationStatusBadge } from "../components/jobs/ApplicationStatusBadge";
import { ApplicationCard } from "../components/application/ApplicationCard";
import { toast } from "sonner";
import { WithdrawDialog } from "../components/dialog/WithdrawDialog";

export default function AppliedJobsPage() {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [target, setTarget] = useState<ApplicationCardData | null>(null);

    const applications = useQuery({
        queryKey: queryKeys.applications.mine(page, PAGE_SIZE),
        queryFn: () => dataProvider.listMyApplications<MyApplicationItem>(page, PAGE_SIZE),
        placeholderData: keepPreviousData,
    });

    const withdraw = useMutation<unknown, HttpError, number>({
        mutationFn: (applicationId) => dataProvider.withdrawApplication(applicationId),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: queryKeys.applications.all });
            toast.success("Application withdrawn");
            setTarget(null);
        },
    });

    const items = applications.data?.items ?? [];
    const total = applications.data?.count ?? 0;

    return (
        <>
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
                    {items.map((application: ApplicationCardData) => (
                        <li key={application.id}>
                            <ApplicationCard
                                application={application}
                                href={`/jobs/${application.job.id}`}
                                companyHref={`/companies/${application.job.company.id}`}
                                onWithdraw={(a) => {
                                    withdraw.reset(); // forget an earlier error
                                    setTarget(a);
                                }}
                            />
                        </li>
                    ))}
                </ul>
            </CollectionShell>
            <WithdrawDialog
                open={target !== null}
                onClose={() => setTarget(null)}
                jobTitle={target?.job.title ?? ""}
                companyName={target?.job.company.name ?? ""}
                isPending={withdraw.isPending}
                error={withdraw.error}
                onConfirm={() => target && withdraw.mutate(target.id)}
            />
        </>
    )
}