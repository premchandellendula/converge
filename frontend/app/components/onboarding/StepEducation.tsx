import { FieldError, inputClass, labelClass, secondaryButton } from "../ui";
import { Draft, EDUCATION_LEVELS, EducationDraft, EducationLevel, Errors, newEducation } from "./draft";

export const StepEducation = ({
    draft,
    errors,
    onChange
}: {
    draft: Draft;
    errors: Errors,
    onChange: (patch: Partial<Draft>) => void;
}) => {
    const update = (key: number, patch: Partial<EducationDraft>) => onChange({ educations: draft.educations.map((e) => (e.key === key ? { ...e, ...patch } : e)) });
    return (
        <div className="space-y-4">
            {draft.educations.length === 0 && (
                <p className="text-sm text-stone-600 dark:text-stone-400">
                    Add your schooling and degrees, or skip this and add them later from your profile.
                </p>
            )}

            {draft.educations.map((edu, index) => {
                const id = (field: string) => `onb-edu-${edu.key}-${field}`;
                const error = (field: string) => errors[`edu.${edu.key}.${field}`];
                const describedBy = (field: string) => (error(field) ? `${id(field)}-error` : undefined);

                return (
                    <fieldset key={edu.key} className="space-y-4 rounded-lg border border-stone-200 p-4 dark:border-stone-800">
                        <legend>Education {index + 1}</legend>

                        <div>
                            <label htmlFor={id("level")} className={labelClass}>Level</label>
                            <select
                                id={id("level")}
                                className={inputClass}
                                value={edu.level}
                                onChange={(e) => update(edu.key, { level: e.target.value as EducationLevel })}
                            >
                                {EDUCATION_LEVELS.map((l) => (
                                <option key={l.value} value={l.value}>{l.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor={id("institution")} className={labelClass}>School or college
                            </label>
                            <input
                                id={id("institution")}
                                className={inputClass}
                                value={edu.institution}
                                onChange={(e) => update(edu.key, { institution: e.target.value })}
                                aria-invalid={Boolean(error("institution"))}
                                aria-describedby={describedBy("institution")}
                            />
                            <FieldError id={`${id("institution")}-error`} message={error("institution")} />
                        </div>
                        <div>
                            <label htmlFor={id("course")} className={labelClass}>Course or stream (optional)</label>
                            <input
                                id={id("course")}
                                className={inputClass}
                                placeholder="B.Tech, Computer Science"
                                value={edu.course}
                                onChange={(e) => update(edu.key, { course: e.target.value })}
                                aria-invalid={Boolean(error("course"))}
                                aria-describedby={describedBy("course")}
                            />
                            <FieldError id={`${id("course")}-error`} message={error("course")} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label htmlFor={id("startYear")} className={labelClass}>Start year</label>
                                <input
                                    id={id("startYear")}
                                    inputMode="numeric"
                                    className={inputClass}
                                    placeholder="2019"
                                    value={edu.startYear}
                                    onChange={(e) => update(edu.key, { startYear: e.target.value })}
                                    aria-invalid={Boolean(error("startYear"))}
                                    aria-describedby={describedBy("startYear")}
                                />
                                <FieldError id={`${id("startYear")}-error`} message={error("startYear")} />
                            </div>
                            <div>
                                <label htmlFor={id("endYear")} className={labelClass}>End year</label>
                                <input
                                    id={id("endYear")}
                                    inputMode="numeric"
                                    className={inputClass}
                                    placeholder="2023"
                                    value={edu.endYear}
                                    onChange={(e) => update(edu.key, { endYear: e.target.value })}
                                    aria-invalid={Boolean(error("endYear"))}
                                    aria-describedby={describedBy("endYear")}
                                />
                                <FieldError id={`${id("endYear")}-error`} message={error("endYear")} />
                            </div>
                        </div>
                        <div className="grid grid-cols-[1fr_auto] gap-3">
                            <div>
                                <label htmlFor={id("score")} className={labelClass}>Score (optional)</label>
                                <input
                                    id={id("score")}
                                    inputMode="decimal"
                                    className={inputClass}
                                    placeholder={edu.scoreType === "CGPA" ? "8.2" : "82"}
                                    value={edu.score}
                                    onChange={(e) => update(edu.key, { score: e.target.value })}
                                    aria-invalid={Boolean(error("score"))}
                                    aria-describedby={describedBy("score")}
                                />
                                <FieldError id={`${id("score")}-error`} message={error("score")} />
                            </div>
                            <div>
                                <label htmlFor={id("scoreType")} className={labelClass}>Out of</label>
                                <select
                                    id={id("scoreType")}
                                    className={inputClass}
                                    value={edu.scoreType}
                                    onChange={(e) => update(edu.key, { scoreType: e.target.value as "PERCENTAGE" | "CGPA" })}
                                >
                                <option value="PERCENTAGE">100 (%)</option>
                                <option value="CGPA">10 (CGPA)</option>
                                </select>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => onChange({ educations: draft.educations.filter((e) => e.key !== edu.key) })}
                            className="text-sm font-medium text-red-700 hover:underline dark:text-red-400"
                        >
                            Remove
                        </button>
                    </fieldset>
                )
            })}
            {draft.educations.length < 10 && (
                <button type="button" className={secondaryButton} onClick={() => onChange({ educations: [...draft.educations, newEducation()] })}>
                    {draft.educations.length === 0 ? "Add education" : "Add another"}
                </button>
            )}
        </div>
    )
}
