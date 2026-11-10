"use client";

import { JobForm } from "@/app/components/jobs/JobForm";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { dataProvider, HttpError, queryKeys } from "@/providers/dataProvider";
import { CreateJobBody } from "@/lib/types";

type CreateJobResult = Awaited<ReturnType<typeof dataProvider.create>>;

export default function NewJobPage() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const create = useMutation<CreateJobResult, HttpError, CreateJobBody>({
        mutationFn: (body: CreateJobBody) => dataProvider.create("jobs", { data: body }),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
            router.push("/recruiter/jobs");
        }
    });

    return (
        <main className="mx-auto w-full max-w-3xl space-y-6 p-6">
            <h1 className="text-2xl font-semibold text-stone-900 dark:text-stone-50">Post a job</h1>

            <JobForm
                submitLabel="Post job"
                isSubmitting={create.isPending}
                error={create.error}
                onEdit={() => {
                    if (create.isError) create.reset(); // the last server answer no longer applies
                }}
                onSubmit={(body) => create.mutate(body)}
            />
        </main>
    );
}
