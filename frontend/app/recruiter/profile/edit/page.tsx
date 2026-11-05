"use client";

// Place at: app/(app)/recruiter/profile/edit/page.tsx   ->  /recruiter/profile/edit

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { dataProvider, HttpError, queryKeys } from "@/providers/dataProvider";
import { friendlyMessage } from "@/lib/notify";
import { Alert, primaryButton, secondaryButton } from "@/app/components/ui";
import { buildUpdateBody, profileToDraft, RecruiterProfile, recruiterProfileKey, useRecruiterProfile } from "@/lib/recruiterProfile";
import { Errors, mapRecruiterIssues, RecruiterDraft, validateAbout } from "@/app/components/recruiter/onboarding/draft";
import StepAbout from "@/app/components/recruiter/onboarding/StepAbout";

function ProfileForm({ profile }: { profile: RecruiterProfile }) {
    const router = useRouter();
    const queryClient = useQueryClient();

    // Starts from the saved profile once. Later background refetches never overwrite what you are typing.
    const [draft, setDraft] = useState<RecruiterDraft>(() => profileToDraft(profile));
    const [errors, setErrors] = useState<Errors>({});

    const focusFirstError = () => {
        setTimeout(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(), 0);
    };

    const save = useMutation<unknown, HttpError, RecruiterDraft>({
        mutationFn: (value) => dataProvider.update("recruiters", { id: "me", data: buildUpdateBody(value) }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: recruiterProfileKey });
            await queryClient.invalidateQueries({ queryKey: queryKeys.me });
            toast.success("Profile updated");
            router.push("/recruiter/profile");
        },
        onError: (error) => {
            const { errors: found } = mapRecruiterIssues(error.issues ?? []);
            if (Object.keys(found).length > 0) {
                setErrors(found);
                focusFirstError();
            }
        },
    });

    // Once an error has been shown, re-check as the person types so it clears right away.
    const patch = (changes: Partial<RecruiterDraft>) => {
        const next = { ...draft, ...changes };
        setDraft(next);
        if (Object.keys(errors).length > 0) setErrors(validateAbout(next));
    };

    function handleSubmit() {
        if (save.isPending) return;
        const found = validateAbout(draft);
        setErrors(found);
        if (Object.keys(found).length > 0) {
            focusFirstError();
            return;
        }
        save.mutate(draft);
    }

    return (
        <main className="mx-auto w-full max-w-2xl space-y-5 p-6 pb-0">
            <div className="flex items-baseline justify-between gap-3">
                <h1 className="text-2xl font-semibold text-stone-900 dark:text-stone-50">Edit profile</h1>
                <Link href="/recruiter/profile" className="text-sm font-medium text-purple-700 hover:underline dark:text-purple-400">
                    Back to profile
                </Link>
            </div>

            {save.error && Object.keys(errors).length === 0 && <Alert>{friendlyMessage(save.error)}</Alert>}
            {Object.keys(errors).length > 0 && <Alert>Some details need a look. They&apos;re marked below.</Alert>}

            <section className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:p-6">
                <StepAbout draft={draft} errors={errors} onChange={patch} />
            </section>

            {profile.company && (
                <p className="text-sm text-stone-600 dark:text-stone-400">
                    Company details for {profile.company.name} are managed by a company admin
                    {profile.companyRole === "ADMIN" && (
                        <>
                            {" "}
                            (you can{" "}
                            <Link href="/recruiter/company" className="font-medium text-purple-700 hover:underline dark:text-purple-400">
                                edit them here
                            </Link>
                            )
                        </>
                    )}
                    .
                </p>
            )}

            {/* Stays visible while scrolling */}
            <div className="sticky bottom-0 -mx-6 flex items-center justify-end gap-3 border-t border-stone-200 bg-white/90 px-6 py-3 backdrop-blur dark:border-stone-800 dark:bg-stone-900/90">
                <Link href="/recruiter/profile" className={secondaryButton}>Cancel</Link>
                <button type="button" className={primaryButton} onClick={handleSubmit} disabled={save.isPending}>
                    {save.isPending ? "Saving…" : "Save changes"}
                </button>
            </div>
        </main>
    );
}

export default function EditRecruiterProfilePage() {
    const profile = useRecruiterProfile();

    if (profile.isPending) {
        return (
            <main className="mx-auto w-full max-w-2xl p-6">
                <div role="status" aria-live="polite" className="h-72 animate-pulse rounded-xl bg-stone-100 dark:bg-stone-800">
                    <span className="sr-only">Loading your profile</span>
                </div>
            </main>
        );
    }

    if (profile.isError) {
        return (
            <main className="mx-auto w-full max-w-2xl p-6">
                <div role="alert" className="space-y-3 rounded-lg border border-red-300 p-4 text-sm dark:border-red-900">
                    <p className="text-red-800 dark:text-red-200">{friendlyMessage(profile.error)}</p>
                    <button type="button" className={secondaryButton} onClick={() => profile.refetch()} disabled={profile.isFetching}>
                        {profile.isFetching ? "Trying again…" : "Try again"}
                    </button>
                </div>
            </main>
        );
    }

    return <ProfileForm profile={profile.data} />;
}