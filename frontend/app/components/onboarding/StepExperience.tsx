import { FieldError, inputClass, labelClass, secondaryButton } from "../ui";
import { DESCRIPTION_MAX, Draft, Errors, ExperienceDraft, newExperience } from "./draft";

const MAX_ENTRIES = 10;

export function StepExperience({
    draft,
    errors,
    onChange,
}: {
    draft: Draft,
    errors: Errors,
    onChange: (patch: Partial<Draft>) => void;
}) {
    const update = (key: number, patch: Partial<ExperienceDraft>) => onChange({ experiences: draft.experiences.map((x) => (x.key === key ? { ...x, ...patch } : x )) });

    const thisMonth = new Date().toISOString().slice(0, 7);

    return (
        <div className="space-y-5">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-stone-800 dark:text-stone-200">
                <input 
                    type="checkbox" 
                    checked={draft.fresher}
                    onChange={(e) => onChange({ fresher: e.target.checked })}
                    className="h-4 w-4 accent-purple-700"
                />
                I&apos;m a fresher, with no work experience yet
            </label>

            {!draft.fresher && (
                <>
                    <fieldset>
                        <legend className="mb-2 text-sm font-medium text-stone-800 dark:text-stone-200">
                            Total experience
                        </legend>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label htmlFor="onb-years" className={labelClass}>Years</label>
                                <input  
                                    id="onb-years"
                                    inputMode="numeric"
                                    className={inputClass}
                                    placeholder="2"
                                    value={draft.years}
                                    onChange={(e) => onChange({ years: e.target.value })}
                                    aria-invalid={Boolean(errors.years)}
                                    aria-describedby={errors.years ? "onb-years-error" : undefined}
                                />
                                <FieldError id="onb-years-error" message={errors.years} />
                            </div>
                            <div>
                                <label htmlFor="onb-months" className={labelClass}>Months (optional)</label>
                                <input
                                    id="onb-months"
                                    inputMode="numeric"
                                    className={inputClass}
                                    placeholder="10"
                                    value={draft.months}
                                    onChange={(e) => onChange({ months: e.target.value })}
                                    aria-invalid={Boolean(errors.months)}
                                    aria-describedby={errors.months ? "onb-months-error" : undefined}
                                />
                                <FieldError id="onb-months-error" message={errors.months} />
                            </div>
                        </div>
                    </fieldset>

                    <div className="space-y-4">
                        <p className="text-sm text-stone-600 dark:text-stone-400">
                            {draft.experiences.length === 0
                                ? "Add the places you've worked. Recruiters look at this closely. You can also add it later from your profile."
                                : "Your work history"}
                        </p>
                        {draft.experiences.map((exp, index) => {
                            const id = (field: string) => `onb-exp-${exp.key}-${field}`;
                            const error = (field: string) => errors[`exp.${exp.key}.${field}`];
                            const describedby = (field: string) => (error(field) ? `${id(field)}-error` : undefined);

                            return (
                                <fieldset
                                    key={exp.key}
                                    className="space-y-4 rounded-lg border broder-stone-200 p-4 dark:border-stone-800"
                                >
                                    <legend className="pt-1 text-sm font-medium text-stone-800 dark:text-stone-200">
                                        Job {index + 1}
                                    </legend>

                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <div>
                                            <label htmlFor={id("title")} className={labelClass}>Jib title</label>
                                            <input 
                                                id={id("title")}
                                                className={inputClass}
                                                placeholder="Frontend Developer"
                                                onChange={(e) => update(exp.key, { title: e.target.value })}
                                                aria-invalid={Boolean(error("title"))}
                                                aria-describedby={describedby("title")}
                                            />
                                            <FieldError id={`${id("title")}-error`} message={error("title")} />
                                        </div>
                                        <div>
                                            <label htmlFor={id("company")} className={labelClass}>Company</label>
                                            <input
                                                id={id("company")}
                                                className={inputClass}
                                                placeholder="Acme Technologies"
                                                value={exp.company}
                                                onChange={(e) => update(exp.key, { company: e.target.value })}
                                                aria-invalid={Boolean(error("company"))}
                                                aria-describedby={describedby("company")}
                                            />
                                            <FieldError id={`${id("company")}-error`} message={error("company")} />
                                        </div>
                                    </div>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <div>
                                            <label htmlFor={id("startDate")} className={labelClass}>Start date</label>
                                            <input
                                                id={id("startDate")}
                                                type="month"
                                                max={thisMonth}
                                                className={inputClass}
                                                placeholder="2022-06"
                                                value={exp.startDate}
                                                onChange={(e) => update(exp.key, { startDate: e.target.value })}
                                                aria-invalid={Boolean(error("startDate"))}
                                                aria-describedby={describedby("startDate")}
                                            />
                                            <FieldError id={`${id("startDate")}-error`} message={error("startDate")} />
                                        </div>
                                        <div>
                                            <label htmlFor={id("endDate")} className={labelClass}>End date</label>
                                            <input
                                                id={id("endDate")}
                                                type="month"
                                                min={exp.startDate || undefined}
                                                max={thisMonth}
                                                className={`${inputClass} disabled:cursor-not-allowed disabled:opacity-50`}
                                                placeholder="2024-03"
                                                disabled={exp.current}
                                                value={exp.current ? "" : exp.endDate}
                                                onChange={(e) => update(exp.key, { endDate: e.target.value })}
                                                aria-invalid={Boolean(error("endDate"))}
                                                aria-describedby={describedby("endDate")}
                                            />
                                            <FieldError id={`${id("endDate")}-error`} message={error("endDate")} />
                                        </div>
                                    </div>
                                    <label className="flex cursor-pointer items-center gap-2 text-sm text-stone-800 dark:text-stone-200">
                                        <input
                                            type="checkbox"
                                            checked={exp.current}
                                            onChange={(e) =>
                                                update(exp.key, { current: e.target.checked, endDate: "" })
                                            }
                                            className="h-4 w-4 accent-purple-700"
                                        />
                                        I currently work here
                                    </label>
                                    <div>
                                        <label htmlFor={id("description")} className={labelClass}>
                                            Description (optional)
                                        </label>
                                        <textarea
                                            id={id("description")}
                                            rows={4}
                                            maxLength={DESCRIPTION_MAX}
                                            className={`${inputClass} min-h-24 resize-y`}
                                            placeholder="What did you build or own? Mention tools and results."
                                            value={exp.description}
                                            onChange={(e) => update(exp.key, { description: e.target.value })}
                                            aria-invalid={Boolean(error("description"))}
                                            aria-describedby={describedby("description")}
                                        />
                                        <div className="mt-1 flex items-start justify-between gap-3">
                                            <FieldError id={`${id("description")}-error`} message={error("description")} />
                                            <span className="ml-auto text-xs text-stone-500 dark:text-stone-400">
                                                {exp.description.length}/{DESCRIPTION_MAX}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            onChange({ experiences: draft.experiences.filter((x) => x.key !== exp.key) })
                                        }
                                        className="text-sm font-medium text-red-700 hover:underline dark:text-red-400"
                                    >
                                        Remove
                                    </button>
                                </fieldset>
                            )
                        })}
                        {draft.experiences.length < MAX_ENTRIES && (
                            <button
                                type="button"
                                className={secondaryButton}
                                onClick={() => onChange({ experiences: [...draft.experiences, newExperience()] })}
                            >
                                {draft.experiences.length === 0 ? "Add work experience" : "Add another job"}
                            </button>
                        )}
                    </div>
                </>
            )}
            <div>
                <label htmlFor="onb-location" className={labelClass}>Current location (optional)</label>
                <input
                    id="onb-location"
                    className={inputClass}
                    placeholder="Hyderabad"
                    value={draft.location}
                    onChange={(e) => onChange({ location: e.target.value })}
                    aria-invalid={Boolean(errors.location)}
                    aria-describedby={errors.location ? "onb-location-error" : undefined}
                />
                <FieldError id="onb-location-error" message={errors.location} />
            </div>
        </div>
    )
}