"use client";

import { useRouter } from "next/navigation";
import { buildBody, Draft, EMPTY_DRAFT, Errors, mapServerIssues, validateEducation, validateExperience, validatePreferences, validateSkill } from "../components/onboarding/draft"
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { dataProvider, HttpError, queryKeys } from "@/providers/dataProvider";
import { friendlyMessage } from "@/lib/notify";
import { Alert, primaryButton, secondaryButton } from "../components/ui";
import { StepEducation } from "../components/onboarding/StepEducation";
import StepSkills from "../components/onboarding/StepSkills";
import { StepExperience } from "../components/onboarding/StepExperience";
import { StepResume } from "../components/onboarding/StepResume";
import { Stepper } from "../components/onboarding/Stepper";
import { useMe } from "@/lib/auth";
import { homeFor } from "@/providers/authProvider";
import { StepPreferences } from "../components/onboarding/StepPreferences";

const STEPS = [
    { id: "education", label: "Education", title: "Your education", hint: "Add your schooling and degrees." },
    { id: "skills", label: "Skills", title: "Your skills", hint: "Recruiters search by skill, so add the ones you're best at." },
    { id: "experience", label: "Experience", title: "Your experience", hint: "Tell us how much work experience you have." },
    { id: "preferences", label: "Preferences", title: "Your preferences", hint: "Salary, notice period and where you'd like to work." },
    { id: "resume", label: "Resume", title: "Your resume", hint: "Upload a PDF so you can apply to jobs in one click." },
] as const;

type StepId = (typeof STEPS)[number]["id"];
const LAST_FORM_STEP = 3;
const YEAR = /^\d{4}$/;
const WHOLE_NUMBER = /^\d{1,2}$/;


function validate(step: StepId, draft: Draft): Errors {
    if(step === "education") return validateEducation(draft);
    if (step === "skills") return validateSkill(draft);
    if (step === "experience") return validateExperience(draft);
    if (step === "preferences") return validatePreferences(draft);
    return {};
}

export default function Onboarding(){
    const router = useRouter();
    const queryClient = useQueryClient();
    const { data: me } = useMe()
    const [step, setStep] = useState(0);
    const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
    const [errors, setErrors] = useState<Errors>({});

    const current = STEPS[step];
    const save = useMutation<unknown, HttpError, Draft>({
        mutationFn: (value) => dataProvider.create("applicants", { data: buildBody(value) })
    })

    const goTo = (index: number) => {
        setErrors({});
        save.reset();
        setStep(index);
    }

    const finish = async () => {
        await queryClient.invalidateQueries({ queryKey: queryKeys.me });
        router.replace(me ? homeFor(me.role) : "/");
    };
    // Once an error has been shown, re-check as the person types so it clears right away.
    const patch = (changes: Partial<Draft>) => {
        const next = { ...draft, ...changes };
        setDraft(next);
        if (Object.keys(errors).length > 0) setErrors(validate(current.id, next));
    };

    const next = () => {
        const found = validate(current.id, draft);
        setErrors(found);
        if(Object.keys(found).length > 0) return;

        if(step < LAST_FORM_STEP){
            goTo(step + 1);
            return;
        }
        save.mutate(draft, {
            onSuccess: () => goTo(step + 1),
            onError: (error) => {
                // The server found something our checks missed: show it next to its field
                // and send the person back to the step it belongs to.
                const { errors: serverErrors, step: target } = mapServerIssues(error.issues ?? [], draft);
                if (target !== null) {
                    setErrors(serverErrors);
                    setStep(target);
                }
            },
        });
    }

    return (
        <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:py-12">
            <header className="mb-8">
                <h1 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">Set up your profile</h1>
                <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
                    A few quick steps so we can match you with the right jobs.
                </p>
            </header>

            <Stepper steps={STEPS.map(({ id, label }) => ({ id, label}))} current={step} onSelect={goTo} />
            
            <section
                aria-labelledby="onb-step-title"
                className="mt-6 rounded-xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6 dark:border-stone-800 dark:bg-stone-900"
            >
                <h2 id="onb-step-title" className="text-lg font-semibold text-stone-900 dark:text-stone-100">
                    {current.title}
                </h2>
                <p className="mb-5 mt-1 text-sm text-stone-600 dark:text-stone-400">{current.hint}</p>

                {save.error && (
                    <div className="mb-4">
                        <Alert>{friendlyMessage(save.error)}</Alert>
                    </div>
                )}

                {current.id === "education" && <StepEducation draft={draft} errors={errors} onChange={patch} />}
                {current.id === "skills" && <StepSkills draft={draft} errors={errors} onChange={patch} />}
                {current.id === "experience" && <StepExperience draft={draft} errors={errors} onChange={patch} />}
                {current.id === "preferences" && <StepPreferences draft={draft} errors={errors} onChange={patch} />}
                {current.id === "resume" && <StepResume onDone={finish} onSkip={finish} />}

                {current.id !== "resume" && (
                    <div className="mt-6 flex items-center justify-between gap-3">
                        {step > 0 ? (
                            <button type="button" className={secondaryButton} onClick={() => goTo(step - 1)} disabled={save.isPending}>
                                Back
                            </button>
                        ) : (
                            <span />
                        )}
                        <button type="button" className={primaryButton} onClick={next} disabled={save.isPending}>
                            {save.isPending ? "Saving…" : step === LAST_FORM_STEP ? "Save and continue" : "Continue"}
                        </button>
                    </div>
                )}
            </section>
        </main>
    )
}