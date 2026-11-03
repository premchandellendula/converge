import { FieldError, inputClass, labelClass } from "../../ui";
import { BIO_MAX, Errors, RecruiterDraft } from "./draft"

const StepAbout = ({
    draft,
    errors,
    onChange
}: {
    draft: RecruiterDraft,
    errors: Errors,
    onChange: (patch: Partial<RecruiterDraft>) => void;
}) => {
    const field = (name: keyof RecruiterDraft) => ({
        "aria-invalid": Boolean(errors[name]),
        "aria-describedby": errors[name] ? `rec-${name}-error` : undefined,
    });
    return (
        <div className="space-y-5">
            <div>
                <label htmlFor="rec-designation" className={labelClass}>Your job title</label>
                <input
                    id="rec-designation"
                    className={inputClass}
                    placeholder="Talent Acquisition Manager"
                    value={draft.designation}
                    onChange={(e) => onChange({ designation: e.target.value })}
                    {...field("designation")}
                />
                <FieldError id="rec-designation-error" message={errors.designation} />
            </div>

            <div>
                <label htmlFor="rec-department" className={labelClass}>Department (optional)</label>
                <input
                    id="rec-department"
                    className={inputClass}
                    placeholder="Human Resources"
                    value={draft.department}
                    onChange={(e) => onChange({ department: e.target.value })}
                    {...field("department")}
                />
                <FieldError id="rec-department-error" message={errors.department} />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
                <div>
                    <label htmlFor="rec-workEmail" className={labelClass}>Work email (optional)</label>
                    <input
                        id="rec-workEmail"
                        type="email"
                        className={inputClass}
                        placeholder="you@company.com"
                        value={draft.workEmail}
                        onChange={(e) => onChange({ workEmail: e.target.value })}
                        {...field("workEmail")}
                    />
                    <FieldError id="rec-workEmail-error" message={errors.workEmail} />
                </div>
                <div>
                    <label htmlFor="rec-linkedinUrl" className={labelClass}>LinkedIn (optional)</label>
                    <input
                        id="rec-linkedinUrl"
                        className={inputClass}
                        placeholder="linkedin.com/in/your-name"
                        value={draft.linkedinUrl}
                        onChange={(e) => onChange({ linkedinUrl: e.target.value })}
                        {...field("linkedinUrl")}
                    />
                    <FieldError id="rec-linkedinUrl-error" message={errors.linkedinUrl} />
                </div>
            </div>

            <div>
                <label htmlFor="rec-bio" className={labelClass}>About you (optional)</label>
                <textarea
                    id="rec-bio"
                    rows={4}
                    maxLength={BIO_MAX}
                    className={`${inputClass} min-h-24 resize-y`}
                    placeholder="A line or two about the teams you hire for."
                    value={draft.bio}
                    onChange={(e) => onChange({ bio: e.target.value })}
                    {...field("bio")}
                />
                <div className="mt-1 flex items-start justify-between gap-3">
                    <FieldError id="rec-bio-error" message={errors.bio} />
                    <span className="ml-auto text-xs text-stone-500 dark:text-stone-400">
                        {draft.bio.length}/{BIO_MAX}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default StepAbout