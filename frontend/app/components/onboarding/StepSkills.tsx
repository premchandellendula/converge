"use client"

import { KeyboardEvent, useDeferredValue, useState } from "react";
import { Draft, Errors } from "./draft"
import { useQuery } from "@tanstack/react-query";
import { dataProvider } from "@/providers/dataProvider";
import { FieldError, inputClass, labelClass } from "../ui";

const StepSkills = ({
    draft,
    errors,
    onChange,
}: {
    draft: Draft,
    errors: Errors,
    onChange: (patch: Partial<Draft>) => void;
}) => {
    const [text, setText] = useState("");
    const typed = useDeferredValue(text.trim());
    const suggestions = useQuery({
        queryKey: ["skills", typed],
        queryFn: () => dataProvider.searchSkills(typed, 8),
        enabled: typed.length > 0,
        staleTime: 5 * 60_000,
    })

    const has = (name: string) => draft.skills.some((s) => s.toLowerCase() === name.toLowerCase());
    const shown = (suggestions.data ?? []).filter((s) => !has(s.name));

    function addSkill(raw: string){
        const name = raw.trim();
        setText("");
        if(!name || name.length > 50) return;
        const known = suggestions.data?.find((s) => s.name.toLowerCase() === name.toLowerCase())?.name ?? name;
        if(!has(known)) onChange({ skills: [ ...draft.skills, known ]});
    }

    function handleKeyDown(e: KeyboardEvent<HTMLInputElement>){
        if(e.key === "Enter" || e.key === ","){
            e.preventDefault();
            addSkill(text);
        }
    }

    return (
        <div className="space-y-4">
            <div>
                <label htmlFor="onb-skills" className={labelClass}>Your skills</label>
                <input 
                    id="onb-skills"
                    className={inputClass}
                    placeholder="Type a skill ans press Enter"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={() => addSkill(text)}
                    aria-invalid={Boolean(errors.skills)}
                    aria-describedby={errors.skills ? "onb-skills-error" : undefined}
                />
                <FieldError id="onb-skills-error" message={errors.skills} />
            </div>

            {shown.length > 0 && (
                <ul aria-label="Suggested skills" className="flex flex-wrap gap-1.5">
                    {shown.map((s) => (
                        <li key={s.id}>
                            <button
                                type="button"
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    addSkill(s.name)
                                }}
                                className="rounded-md border border-stone-300 px-2 py-1 text-xs text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
                            >
                                + {s.name}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
            {draft.skills.length > 0 && (
                <ul aria-label="Your skills" className="flex flex-wrap gap-1.5">
                    {draft.skills.map((skill) => (
                        <li
                            key={skill}
                            className="flex items-center gap-1 rounded-md bg-purple-50 py-1 pl-2 pr-1 text-xs text-purple-900 dark:bg-purple-950 dark:text-purple-200"
                        >
                            {skill}
                            <button
                                type="button"
                                aria-label={`Remove ${skill}`}
                                onClick={() => onChange({ skills: draft.skills.filter((s) => s !== skill) })}
                                className="grid h-5 w-5 place-items-center rounded hover:bg-purple-100 dark:hover:bg-purple-900"
                            >
                                ×
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

export default StepSkills