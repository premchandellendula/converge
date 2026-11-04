"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { Pagination } from "@/app/components/pagination";
import { secondaryButton } from "@/app/components/ui";
import { friendlyMessage } from "@/lib/notify";

/** Shared layout for "a paged list of jobs": title, loading, error, empty state and pagination. */
export function CollectionShell({
    title,
    query,
    total,
    page,
    pageSize,
    onPageChange,
    emptyTitle,
    emptyHint,
    children,
}: {
    title: string;
    query: { isPending: boolean; isError: boolean; error: unknown; isFetching: boolean; refetch: () => unknown };
    total: number;
    page: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    emptyTitle: string;
    emptyHint: string;
    children: ReactNode; // the <ul> of results
}) {
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return (
        <main className="mx-auto w-full max-w-4xl space-y-4 p-6">
            <div className="flex items-baseline justify-between gap-3">
                <h1 className="text-2xl font-semibold text-stone-900 dark:text-stone-50">{title}</h1>
                {!query.isPending && !query.isError && total > 0 && (
                    <p aria-live="polite" className="text-sm text-stone-600 dark:text-stone-400">
                        {total} {total === 1 ? "job" : "jobs"}
                        {query.isFetching && " · updating…"}
                    </p>
                )}
            </div>

            {query.isPending ? (
                <div role="status" aria-live="polite" className="space-y-3">
                    {[0, 1, 2].map((i) => (
                        <div key={i} className="h-36 animate-pulse rounded-lg bg-stone-100 dark:bg-stone-800" />
                    ))}
                    <span className="sr-only">Loading</span>
                </div>
            ) : query.isError ? (
                <div role="alert" className="space-y-3 rounded-lg border border-red-300 p-4 text-sm dark:border-red-900">
                    <p className="text-red-800 dark:text-red-200">{friendlyMessage(query.error)}</p>
                    <button type="button" className={secondaryButton} onClick={() => query.refetch()} disabled={query.isFetching}>
                        {query.isFetching ? "Trying again…" : "Try again"}
                    </button>
                </div>
            ) : total === 0 ? (
                <div className="space-y-3 rounded-lg border border-stone-200 p-8 text-center dark:border-stone-800">
                    <p className="font-medium text-stone-800 dark:text-stone-200">{emptyTitle}</p>
                    <p className="text-sm text-stone-600 dark:text-stone-400">{emptyHint}</p>
                    <Link href="/jobs" className={`${secondaryButton} inline-block`}>Browse jobs</Link>
                </div>
            ) : (
                <>
                    <div className={`transition-opacity ${query.isFetching ? "opacity-60" : ""}`}>{children}</div>
                    <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
                </>
            )}
        </main>
    );
}