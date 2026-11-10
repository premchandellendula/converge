import { STATUS_LABEL } from "@/lib/applications";
import { ApplicationStatus } from "@/lib/types";


export type TabKey = "ALL" | ApplicationStatus;

const TABS: { key: TabKey; label: string }[] = [
    { key: "ALL", label: "All" },
    { key: "APPLIED", label: STATUS_LABEL.APPLIED },
    { key: "SHORTLISTED", label: STATUS_LABEL.SHORTLISTED },
    { key: "INTERVIEW", label: STATUS_LABEL.INTERVIEW },
    { key: "HIRED", label: STATUS_LABEL.HIRED },
    { key: "REJECTED", label: STATUS_LABEL.REJECTED },
];

export function ApplicationStatusTabs({
    active,
    counts,
    onChange,
}: {
    active: TabKey;
    counts: Record<string, number> | undefined;
    onChange: (tab: TabKey) => void;
}) {
    return (
        // scrolls sideways on narrow screens instead of wrapping
        <div role="tablist" aria-label="Filter applications by status" className="flex gap-1 overflow-x-auto border-b border-stone-200 dark:border-stone-800">
            {TABS.map((t) => {
                const selected = active === t.key;
                const count = counts?.[t.key];
                return (
                    <button
                        key={t.key}
                        type="button"
                        role="tab"
                        aria-selected={selected}
                        onClick={() => onChange(t.key)}
                        className={`-mb-px flex shrink-0 items-center gap-2 border-b-2 px-3 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-purple-600 ${
                            selected
                                ? "border-purple-600 text-purple-700 dark:border-purple-400 dark:text-purple-300"
                                : "border-transparent text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
                        }`}
                    >
                        {t.label}
                        {count !== undefined && (
                            <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs tabular-nums text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                                {count}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}