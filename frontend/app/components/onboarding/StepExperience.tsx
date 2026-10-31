import { FieldError, inputClass, labelClass } from "../ui";
import { Draft, Errors } from "./draft";

export function StepExperience({
    draft,
    errors,
    onChange,
}: {
    draft: Draft,
    errors: Errors,
    onChange: (patch: Partial<Draft>) => void;
}) {
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