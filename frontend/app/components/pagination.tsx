import { secondaryButton } from "./ui";

export function Pagination({
    page,
    totalPages,
    onPageChange
}: {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}) {
    if(totalPages <= 1) return null;

    return (
        <nav aria-label="Pagination" className="flex items-center justify-between gap-3 pt-2">
            <button type="button" className={secondaryButton} disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
                Prev
            </button>
            <span aria-live="polite" className="text-sm text-stone-600 dark:text-stone-400">
                Page {page} of {totalPages}
            </span>
            <button
                type="button"
                className={secondaryButton}
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
            >
                Next
            </button>
        </nav>
    )
}