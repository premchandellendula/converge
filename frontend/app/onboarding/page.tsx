"use client";

import { useRouter } from "next/navigation";
import { Draft, Errors } from "../components/onboarding/draft"
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { dataProvider, HttpError } from "@/providers/dataProvider";
import { friendlyMessage } from "@/lib/notify";
import { Alert, primaryButton, secondaryButton } from "../components/ui";
import { StepEducation } from "../components/onboarding/StepEducation";
import StepSkills from "../components/onboarding/StepSkills";
import { StepExperience } from "../components/onboarding/StepExperience";
import { StepResume } from "../components/onboarding/StepResume";
import { Stepper } from "../components/onboarding/Stepper";

const STEPS = [
    { id: "education", label: "Education", title: "Your education", hint: "Add your schooling and degrees." },
    { id: "skills", label: "Skills", title: "Your skills", hint: "Recruiters search by skill, so add the ones you're best at." },
    { id: "experience", label: "Experience", title: "Your experience", hint: "Tell us how much work experience you have." },
    { id: "resume", label: "Resume", title: "Your resume", hint: "Upload a PDF so you can apply to jobs in one click." },
] as const;

type StepId = (typeof STEPS)[number]["id"];
const LAST_FORM_STEP = 2;
const YEAR = /^\d{4}$/;
const WHOLE_NUMBER = /^\d{1,2}$/;

const initialDraft = (): Draft => ({
    educations: [],
    skills: [],
    fresher: false,
    years: "",
    months: "",
    location: ""
})

function validate(step: StepId, draft: Draft): Errors {
    const errors: Errors = {};
    if(step === "education"){
        for(const edu of draft.educations){
            const key = (field: string) => `edu.${edu.key}.${field}`;
            const start = edu.startYear.trim();
            const end = edu.endYear.trim();

            if (!edu.institution.trim()) errors[key("institution")] = "Enter your school or college";
            else if (edu.institution.trim().length > 150) errors[key("institution")] = "Keep this under 150 characters";

            if (edu.course.trim().length > 100) errors[key("course")] = "Keep this under 100 characters";

            if (!YEAR.test(start)) errors[key("startYear")] = "Enter a 4-digit year";
            if (!YEAR.test(end)) errors[key("endYear")] = "Enter a 4-digit year";
            else if (YEAR.test(start) && Number(end) < Number(start)) errors[key("endYear")] = "Can't be before the start year";

            if (edu.score.trim()) {
                const max = edu.scoreType === "CGPA" ? 10 : 100;
                const n = Number(edu.score);
                if (!Number.isFinite(n) || n < 0 || n > max) errors[key("score")] = `Enter a score between 0 and ${max}`;
            }
        }
    }
    if (step === "skills" && draft.skills.length === 0) {
        errors.skills = "Add at least one skill";
    }
    if (step === "experience") {
        if (!draft.fresher) {
            if (!WHOLE_NUMBER.test(draft.years.trim())) errors.years = "Enter your years of experience";
            if (draft.months.trim() && (!WHOLE_NUMBER.test(draft.months.trim()) || Number(draft.months) > 11)) {
                errors.months = "Enter a number from 0 to 11";
            }
        }
        if (draft.location.trim().length > 150) errors.location = "Keep this under 150 characters";
    }
    return errors;
}

export default function Onboarding(){
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [draft, setDraft] = useState<Draft>(initialDraft);
    const [errors, setErrors] = useState<Errors>({});

    const current = STEPS[step];
    const save = useMutation<unknown, HttpError, Draft>({
        // mutationFn: (value) => dataProvider.saveOnboarding(value);
    })

    const goTo = (index: number) => {
        setErrors({});
        save.reset();
        setStep(index);
    }

    const finish = () => router.replace("/");
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

        if(step === LAST_FORM_STEP){
            save.mutate(draft, { onSuccess: () => goTo(step + 1)});
        }else {
            goTo(step + 1);
        }
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