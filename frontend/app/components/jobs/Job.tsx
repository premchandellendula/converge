"use client";

import { useRouter } from "next/navigation";
import { JobForm } from "./JobForm";

export default function NewJobPage() {
    const router = useRouter();
    const create = useCreateJob();

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
            onSubmit={(body) => create.mutate(body, { onSuccess: () => router.push("/recruiter/jobs") })}
        />
        </main>
    );
}