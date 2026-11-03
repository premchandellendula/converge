import { FieldError, inputClass, labelClass } from "../../ui";
import { COMPANY_DESCRIPTION_MAX, Errors, RecruiterDraft } from "./draft";

const StepCompany = ({
    draft,
    errors,
    onChange,
}: {
    draft: RecruiterDraft;
    errors: Errors;
    onChange: (patch: Partial<RecruiterDraft>) => void;
}) => {
    const field = (name: keyof RecruiterDraft) => ({
        "aria-invalid": Boolean(errors[name]),
        "aria-describedby": errors[name] ? `rec-${name}-error` : undefined,
    });

    return (
        <div className="space-y-5">
            <div>
                <label htmlFor="rec-companyName" className={labelClass}>Company name</label>
                <input
                    id="rec-companyName"
                    className={inputClass}
                    placeholder="Acme Technologies"
                    value={draft.companyName}
                    onChange={(e) => onChange({ companyName: e.target.value })}
                    {...field("companyName")}
                />
                <FieldError id="rec-companyName-error" message={errors.companyName} />
            </div>
 
            <div className="grid gap-3 sm:grid-cols-2">
                <div>
                    <label htmlFor="rec-website" className={labelClass}>Website (optional)</label>
                    <input
                        id="rec-website"
                        className={inputClass}
                        placeholder="acme.com"
                        value={draft.website}
                        onChange={(e) => onChange({ website: e.target.value })}
                        {...field("website")}
                    />
                    <FieldError id="rec-website-error" message={errors.website} />
                </div>
                <div>
                    <label htmlFor="rec-headquarters" className={labelClass}>Headquarters (optional)</label>
                    <input
                        id="rec-headquarters"
                        className={inputClass}
                        placeholder="Hyderabad, India"
                        value={draft.headquarters}
                        onChange={(e) => onChange({ headquarters: e.target.value })}
                        {...field("headquarters")}
                    />
                    <FieldError id="rec-headquarters-error" message={errors.headquarters} />
                </div>
            </div>
 
            <div>
                <label htmlFor="rec-companyDescription" className={labelClass}>About the company (optional)</label>
                <textarea
                    id="rec-companyDescription"
                    rows={5}
                    maxLength={COMPANY_DESCRIPTION_MAX}
                    className={`${inputClass} min-h-28 resize-y`}
                    placeholder="What does the company do, and what is it like to work there?"
                    value={draft.companyDescription}
                    onChange={(e) => onChange({ companyDescription: e.target.value })}
                    {...field("companyDescription")}
                />
                <div className="mt-1 flex items-start justify-between gap-3">
                    <FieldError id="rec-companyDescription-error" message={errors.companyDescription} />
                    <span className="ml-auto text-xs text-stone-500 dark:text-stone-400">
                        {draft.companyDescription.length}/{COMPANY_DESCRIPTION_MAX}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default StepCompany