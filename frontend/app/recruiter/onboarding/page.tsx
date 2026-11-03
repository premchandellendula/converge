"use client"

import { Stepper } from "@/app/components/onboarding/Stepper";
import { buildRecruiterBody, EMPTY_RECRUITER_DRAFT, Errors, mapRecruiterIssues, RecruiterDraft, validateAbout, validateCompany } from "@/app/components/recruiter/onboarding/draft";
import StepAbout from "@/app/components/recruiter/onboarding/StepAbout";
import StepCompany from "@/app/components/recruiter/onboarding/StepCompany";
import { Alert, primaryButton, secondaryButton } from "@/app/components/ui";
import { useMe } from "@/lib/auth";
import { friendlyMessage } from "@/lib/notify";
import { homeFor } from "@/providers/authProvider";
import { dataProvider, HttpError, queryKeys } from "@/providers/dataProvider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

const STEPS = [
    { id: "about", label: "About you", hint: "Tell candidates who they'll be hearing from."},
    { id: "company", label: "Company", title: "Your company", hint: "This is what candidates see on your job posts."}
]

type StepId = (typeof STEPS)[number]["id"];
const LAST_STEP = STEPS.length - 1;

function validate(step: StepId, draft: RecruiterDraft): Errors {
    return step === "about" ? validateAbout(draft) : validateCompany(draft);
}

export default function RecruiterOnboarding() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { data: me } = useMe();
    const [step, setStep] = useState(0);
    const [draft, setDraft] = useState<RecruiterDraft>(EMPTY_RECRUITER_DRAFT);
    const [errors, setErrors] = useState<Errors>({});

    const current = STEPS[step];

    const save = useMutation<unknown, HttpError, RecruiterDraft>({
        mutationFn: (value) => dataProvider.create("recruiters/me", { data: buildRecruiterBody(value) }),
    });

    const goTo = (index: number) => {
        setErrors({});
        save.reset();
        setStep(index);
    };

    const patch = (changes: Partial<RecruiterDraft>) => {
        const next = { ...draft, ...changes };
        setDraft(next);
        if (Object.keys(errors).length > 0) setErrors(validate(current.id, next));
    };

    const next = () => {
        const found = validate(current.id, draft);
        setErrors(found);
        if (Object.keys(found).length > 0) return;

        if (step < LAST_STEP) {
            goTo(step + 1);
            return;
        }

        save.mutate(draft, {
            onSuccess: async () => {
                await queryClient.invalidateQueries({ queryKey: queryKeys.me });
                router.replace(me ? homeFor(me.role) : "/recruiter/jobs");
            },
            onError: (error) => {
                const { errors: serverErrors, step: target } = mapRecruiterIssues(error.issues ?? []);
                if (target !== null) {
                    setErrors(serverErrors);
                    setStep(target);
                }
            },
        });
    };

    return (
        <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:py-12">
            <header className="mb-8">
                <h1 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">Set up your recruiter profile</h1>
                <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
                    Two quick steps, then you can start posting jobs.
                </p>
            </header>

            <Stepper steps={STEPS.map(({ id, label }) => ({ id, label }))} current={step} onSelect={goTo} />

            <section
                aria-labelledby="rec-step-title"
                className="mt-6 rounded-xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6 dark:border-stone-800 dark:bg-stone-900"
            >
                <h2 id="rec-step-title" className="text-lg font-semibold text-stone-900 dark:text-stone-100">
                    {current.title}
                </h2>
                <p className="mb-5 mt-1 text-sm text-stone-600 dark:text-stone-400">{current.hint}</p>

                {save.error && (
                    <div className="mb-4">
                        <Alert>{friendlyMessage(save.error)}</Alert>
                    </div>
                )}

                {current.id === "about" && <StepAbout draft={draft} errors={errors} onChange={patch} />}
                {current.id === "company" && <StepCompany draft={draft} errors={errors} onChange={patch} />}

                <div className="mt-6 flex items-center justify-between gap-3">
                    {step > 0 ? (
                        <button type="button" className={secondaryButton} onClick={() => goTo(step - 1)} disabled={save.isPending}>
                            Back
                        </button>
                    ) : (
                        <span />
                    )}
                    <button type="button" className={primaryButton} onClick={next} disabled={save.isPending}>
                        {save.isPending ? "Saving…" : step === LAST_STEP ? "Create profile" : "Continue"}
                    </button>
                </div>
            </section>
        </main>
    );
}