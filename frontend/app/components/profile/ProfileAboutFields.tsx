import { EditDraft, SUMMARY_MAX } from "@/lib/profile";
import { Errors } from "../onboarding/draft";
import { FieldError, inputClass, labelClass } from "../ui";

export function ProfileAboutFields({
    draft,
    errors,
    onChange
}: {
    draft: EditDraft,
    errors: Errors,
    onChange: (patch: Partial<EditDraft>) => void;
}){
    const aria = (name: string) => ({
        "aria-invalid": Boolean(errors[name]),
        "aria-describedby": errors[name] ? `prof-${name}-error` : undefined
    })

    return (
        <div className="space-y-5">
            <div>
                <label htmlFor="prof-summary" className={labelClass}>About you</label>
                <textarea
                    id="prof-summary"
                    rows={5}
                    maxLength={SUMMARY_MAX}
                    className={`${inputClass} min-h-28 resize-y`}
                    placeholder="A short introduction: what you do, what you're good at, and what you're looking for."
                    value={draft.summary}
                    onChange={(e) => onChange({ summary: e.target.value })}
                    {...aria("summary")}
                />
                <div className="mt-1 flex items-start justify-between gap-3">
                    <FieldError id="prof-summary-error" message={errors.summary} />
                    <span className="ml-auto text-xs text-stone-500 dark:text-stone-400">
                        {draft.summary.length}/{SUMMARY_MAX}
                    </span>
                </div>
            </div>

            <div>
                <label htmlFor="prof-industry" className={labelClass}>Industry (optional)</label>
                <input
                    id="prof-industry"
                    className={inputClass}
                    placeholder="Information Technology"
                    value={draft.industry}
                    onChange={(e) => onChange({ industry: e.target.value })}
                    {...aria("industry")}
                />
                <FieldError id="prof-industry-error" message={errors.industry} />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
                <div>
                    <label htmlFor="prof-linkedinUrl" className={labelClass}>LinkedIn (optional)</label>
                    <input
                        id="prof-linkedinUrl"
                        className={inputClass}
                        placeholder="linkedin.com/in/your-name"
                        value={draft.linkedinUrl}
                        onChange={(e) => onChange({ linkedinUrl: e.target.value })}
                        {...aria("linkedinUrl")}
                    />
                    <FieldError id="prof-linkedinUrl-error" message={errors.linkedinUrl} />
                </div>
                <div>
                    <label htmlFor="prof-githubUrl" className={labelClass}>GitHub (optional)</label>
                    <input
                        id="prof-githubUrl"
                        className={inputClass}
                        placeholder="github.com/your-name"
                        value={draft.githubUrl}
                        onChange={(e) => onChange({ githubUrl: e.target.value })}
                        {...aria("githubUrl")}
                    />
                    <FieldError id="prof-githubUrl-error" message={errors.githubUrl} />
                </div>
            </div>
        </div>
    );
}