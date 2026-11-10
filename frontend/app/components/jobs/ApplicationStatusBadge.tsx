const STATUS: Record<string, { label: string; className: string }> = {
    APPLIED: { label: "Applied", className: "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300" },
    SHORTLISTED: { label: "Shortlisted", className: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200" },
    INTERVIEW: { label: "Interview", className: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200" },
    HIRED: { label: "Hired", className: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200" },
    REJECTED: { label: "Not selected", className: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200" },
    WITHDRAWN: { label: "Withdrawn", className: "bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400" },
};

export function ApplicationStatusBadge({ status, label }: { status: string; label?: string }) {
    const s = STATUS[status] ?? { label: status, className: STATUS.APPLIED.className };
    return <span className={`rounded-md px-2 py-1 text-xs font-medium ${s.className}`}>{label ?? s.label}</span>;
}