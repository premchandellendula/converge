import { FieldError, inputClass, labelClass } from "../ui";
import { CURRENCIES, Currency, Draft, Errors } from "./draft";

const NOTICE_PERIODS = [
    { value: "", label: "Select notice period" },
    { value: "0", label: "Immediately" },
    { value: "15", label: "15 days" },
    { value: "30", label: "30 days" },
    { value: "45", label: "45 days" },
    { value: "60", label: "60 days" },
    { value: "90", label: "90 days" },
    { value: "120", label: "More than 90 days" },
];

export function StepPreferences({
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
            <p className="text-sm text-stone-600 dark:text-stone-400">
                Everything here is optional. Recruiters use it to see if a role fits you.
            </p>

            <div className="grid grid-cols-[auto_1fr_1fr] gap-3">
                <div>
                    <label htmlFor="onb-currency" className={labelClass}>Currency</label>
                    <select
                        id="onb-currency"
                        className={inputClass}
                        value={draft.currency}
                        onChange={(e) => onChange({ currency: e.target.value as Currency })}
                        >
                        {CURRENCIES.map((c) => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                    </select>
                </div>
            
                <div>
                    <label htmlFor="onb-expected" className={labelClass}>Expected salary (per year)</label>
                    <input
                        id="onb-expected"
                        inputMode="numeric"
                        className={inputClass}
                        placeholder="1200000"
                        value={draft.expectedSalary}
                        onChange={(e) => onChange({ expectedSalary: e.target.value })}
                        aria-invalid={Boolean(errors.expectedSalary)}
                        aria-describedby={errors.expectedSalary ? "onb-expected-error" : undefined}
                    />
                    <FieldError id="onb-expected-error" message={errors.expectedSalary} />
                </div>
                <div>
                    <label htmlFor="onb-current" className={labelClass}>Current salary (per year)</label>
                    <input
                        id="onb-current"
                        inputMode="numeric"
                        className={inputClass}
                        placeholder="900000"
                        value={draft.currentSalary}
                        onChange={(e) => onChange({ currentSalary: e.target.value })}
                        aria-invalid={Boolean(errors.currentSalary)}
                        aria-describedby={errors.currentSalary ? "onb-current-error" : undefined}
                    />
                    <FieldError id="onb-current-error" message={errors.currentSalary} />
                </div>
            </div>
            <div>
                <label htmlFor="onb-notice" className={labelClass}>Notice period (days)</label>
                <select
                    id="onb-notice"
                    className={inputClass}
                    value={draft.noticePeriodDays}
                    onChange={(e) => onChange({ noticePeriodDays: e.target.value })}
                    aria-invalid={Boolean(errors.noticePeriodDays)}
                    aria-describedby={errors.noticePeriodDays ? "onb-notice-error" : undefined}
                >
                    {NOTICE_PERIODS.map((n) => (
                        <option key={n.value} value={n.value}>{n.label}</option>
                    ))}
                </select>
                <FieldError id="onb-notice-error" message={errors.noticePeriodDays} />
            </div>
            <div>
                <label htmlFor="onb-pref-locations" className={labelClass}>Preferred work locations</label>
                <input
                    id="onb-pref-locations"
                    className={inputClass}
                    placeholder="Hyderabad, Bengaluru, Pune"
                    value={draft.preferredLocations}
                    onChange={(e) => onChange({ preferredLocations: e.target.value })}
                    aria-invalid={Boolean(errors.preferredLocations)}
                    aria-describedby={errors.preferredLocations ? "onb-pref-locations-error" : "onb-pref-locations-hint"}
                />
                <p id="onb-pref-locations-hint" className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                    Separate locations with commas.
                </p>
                <FieldError id="onb-pref-locations-error" message={errors.preferredLocations} />
            </div>
            <div className="space-y-3">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-stone-800 dark:text-stone-200">
                    <input
                        type="checkbox"
                        checked={draft.openToWork}
                        onChange={(e) => onChange({ openToWork: e.target.checked })}
                        className="h-4 w-4 accent-purple-700"
                    />
                    I&apos;m open to new opportunities
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-stone-800 dark:text-stone-200">
                    <input
                        type="checkbox"
                        checked={draft.willingToRelocate}
                        onChange={(e) => onChange({ willingToRelocate: e.target.checked })}
                        className="h-4 w-4 accent-purple-700"
                    />
                    I&apos;m willing to relocate
                </label>
            </div>
        </div>
        
    )
}