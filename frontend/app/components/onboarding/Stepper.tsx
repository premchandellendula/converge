import { Check } from "lucide-react";

type StepperProps = {
    steps: { id: string; label: string }[];
    current: number;
    onSelect: (index: number) => void;
}

export function Stepper({ steps, current, onSelect }: StepperProps){
    return (
        <nav aria-label="Onboarding progress">
            <p className="mb-3 text-xs font-medium text-stone-600 sm:hidden dark:text-stone-400">
                Step {current + 1} of {steps.length}: {steps[current].label}
            </p>

            <ol className="flex items-center">
                {steps.map((step, i) => {
                    const done = i < current;
                    const active = i === current;
                    const isLast = i === steps.length - 1;

                    return (
                        <li key={step.id} className={`flex items-center ${isLast ? "" : "flex-1"}`}>
                            <button
                                type="button"
                                disabled={!done}
                                onClick={() => onSelect(i)}
                                aria-current={active ? "step" : undefined}
                                className={`flex items-center gap-2 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 ${done ? "cursor-pointer" : "cursor-default"}`}
                            >
                                <span
                                    className={`grid size-8 shrink-0 place-items-center rounded-full text-sm font-semibold transition-colors ${done ? "bg-purple-600 text-white" : active ? "border-2 border-purple-600 bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-200" : "border border-stone-300 text-stone-50 dark:border-stone-700 dark:text-stone-400"}`}
                                >
                                    {done ? <Check size={16} aria-hidden="true" /> : i + 1}
                                </span>
                                <span
                                    className={`hidden text-sm sm:inline ${
                                        active
                                            ? "font-semibold text-stone-900 dark:text-stone-100"
                                            : "text-stone-600 dark:text-stone-400"
                                    }`}
                                >
                                    {step.label}
                                    {done && <span className="sr-only"> (completed)</span>}
                                </span>
                            </button>
                            {!isLast && (
                                <span
                                    aria-hidden="true"
                                    className={`mx-2 h-0.5 flex-1 rounded-full transition-colors sm:mx-3 ${
                                        done ? "bg-purple-600" : "bg-stone-300 dark:bg-stone-700"
                                    }`}
                                />
                            )}
                        </li>
                    )
                })}
            </ol>
        </nav>
    )
}