"use client";

// Place at: app/(app)/(candidate)/candidate/profile/edit/page.tsx   ->  /candidate/profile/edit

import Link from "next/link";
import { ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { dataProvider, HttpError, queryKeys } from "@/providers/dataProvider";
import { friendlyMessage } from "@/lib/notify";
import { Alert, primaryButton, secondaryButton } from "@/app/components/ui";
import { Errors } from "@/app/components/onboarding/draft";
import { StepEducation } from "@/app/components/onboarding/StepEducation";
import StepSkills from "@/app/components/onboarding/StepSkills";
import { StepExperience } from "@/app/components/onboarding/StepExperience";
import { StepPreferences } from "@/app/components/onboarding/StepPreferences";
import { ApplicantProfile, buildUpdateBody, EditDraft, mapUpdateIssues, profileKey, profileToDraft, useMyProfile, validateAll } from "@/lib/profile";
import { ProfileAboutFields } from "@/app/components/profile/ProfileAboutFields";

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
    return (
        <section
            aria-labelledby={id}
            className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:p-6"
        >
            <h2 id={id} className="mb-4 text-lg font-semibold text-stone-900 dark:text-stone-50">{title}</h2>
            {children}
        </section>
    );
}

function ProfileForm({ profile }: { profile: ApplicantProfile }) {
    const router = useRouter();
    const queryClient = useQueryClient();

    // Starts from the saved profile once. Later background refetches never overwrite what you are typing.
    const [draft, setDraft] = useState<EditDraft>(() => profileToDraft(profile));
    const [errors, setErrors] = useState<Errors>({});

    const focusFirstError = () => {
        setTimeout(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(), 0);
    };

    const save = useMutation<unknown, HttpError, EditDraft>({
        mutationFn: (value) => dataProvider.update("applicants", { id: "me", data: buildUpdateBody(value) }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: profileKey });
            await queryClient.invalidateQueries({ queryKey: queryKeys.me });
            toast.success("Profile updated");
            router.push("/candidate/profile");
        },
        onError: (error) => {
            const found = mapUpdateIssues(error.issues ?? [], draft);
            if (Object.keys(found).length > 0) {
                setErrors(found);
                focusFirstError();
            }
        },
    });

    // Once an error has been shown, re-check as the person types so it clears right away.
    const patch = (changes: Partial<EditDraft>) => {
        const next = { ...draft, ...changes };
        setDraft(next);
        if (Object.keys(errors).length > 0) setErrors(validateAll(next));
    };

    function handleSubmit() {
        if (save.isPending) return;
        const found = validateAll(draft);
        setErrors(found);
        if (Object.keys(found).length > 0) {
            focusFirstError();
            return;
        }
        save.mutate(draft);
    }

    return (
        <main className="mx-auto w-full max-w-3xl space-y-5 p-6 pb-0">
            <div className="flex items-baseline justify-between gap-3">
                <h1 className="text-2xl font-semibold text-stone-900 dark:text-stone-50">Edit profile</h1>
                <Link href="/profile" className="text-sm font-medium text-purple-700 hover:underline dark:text-purple-400">
                    Back to profile
                </Link>
            </div>

            {save.error && Object.keys(errors).length === 0 && (
                <Alert>{friendlyMessage(save.error)}</Alert>
            )}
            {Object.keys(errors).length > 0 && (
                <Alert>Some details need a look. They&apos;re marked below.</Alert>
            )}

            <Section id="edit-about" title="About">
                <ProfileAboutFields draft={draft} errors={errors} onChange={patch} />
            </Section>

            <Section id="edit-experience" title="Experience">
                <StepExperience draft={draft} errors={errors} onChange={patch} />
            </Section>

            <Section id="edit-education" title="Education">
                <StepEducation draft={draft} errors={errors} onChange={patch} />
            </Section>

            <Section id="edit-skills" title="Skills">
                <StepSkills draft={draft} errors={errors} onChange={patch} />
            </Section>

            <Section id="edit-preferences" title="Job preferences">
                <StepPreferences draft={draft} errors={errors} onChange={patch} />
            </Section>

            {/* Stays visible while scrolling a long form */}
            <div className="sticky bottom-0 -mx-6 flex items-center justify-end gap-3 border-t border-stone-200 bg-white/90 px-6 py-3 backdrop-blur dark:border-stone-800 dark:bg-stone-900/90">
                <Link href="/candidate/profile" className={secondaryButton}>Cancel</Link>
                <button type="button" className={primaryButton} onClick={handleSubmit} disabled={save.isPending}>
                    {save.isPending ? "Saving…" : "Save changes"}
                </button>
            </div>
        </main>
    );
}

export default function EditProfilePage() {
    const profile = useMyProfile();

    if (profile.isPending) {
        return (
            <main className="mx-auto w-full max-w-3xl space-y-4 p-6">
                <div role="status" aria-live="polite" className="space-y-3">
                    {[0, 1, 2].map((i) => (
                        <div key={i} className="h-40 animate-pulse rounded-xl bg-stone-100 dark:bg-stone-800" />
                    ))}
                    <span className="sr-only">Loading your profile</span>
                </div>
            </main>
        );
    }

    if (profile.isError) {
        return (
            <main className="mx-auto w-full max-w-3xl p-6">
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