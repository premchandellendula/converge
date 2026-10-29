import { useMe } from "@/lib/auth";
import { Suspense, useEffect, useState } from "react";
import { JobFilters } from "./JobFilters";
import { friendlyMessage } from "@/lib/notify";
import { JobCard } from "./JobCard";
import { inputClass, secondaryButton } from "../ui";
import { Pagination } from "../pagination";
import { activeFilterCount, PAGE_SIZE, SORT_OPTIONS, SortKey } from "@/lib/jobFilters";
import { useJobFilters } from "@/hooks/useJobFilters";

function JobsView(){
    const {ui, api, setFilters, clearAll } = useJobFilters();
    const jobs = useJobs(api);
    const facets = useJobFacets(api);

    const { data: me } = useMe();
    const isCandidate = me?.role === "Candidate";
    const savedIds = useSavedJobIds(isCandidate);
    const appliedIds = useAppliedJobIds(isCandidate);
    const toggleSave = useToggleSaveJob();

    const [showFilters, setShowFilters] = useState(false); // only matters on small screens
    const [text, setText] = useState(ui.q);

    useEffect(() => {
        const id = setTimeout(() => {
            if (text.trim() !== ui.q) setFilters({ q: text.trim() });
        }, 400);
        return () => clearTimeout(id);
    }, [text, ui.q, setFilters]);

    const count = jobs.data?.count ?? 0;
    const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));
    const activeCount = activeFilterCount(ui);

    function handleClear() {
        setText("");
        clearAll();
    }

    return (
        <main className="mx-auto w-full max-w-6xl space-y-4 p-6">
            <h1 className="sr-only">Jobs</h1>

            <div className="flex flex-wrap items-center gap-3">
                <div className="min-w-56 flex-1">
                    <label htmlFor="job-search" className="sr-only">Search jobs by title or skills</label>
                    <input 
                        id="job-search"
                        type="search"
                        className={`${inputClass} mt-0`}
                        placeholder="Search by job title or skill"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />
                </div>
                
                <div>
                    <label htmlFor="job-sort" className="sr-only">Sort by</label>
                    <select
                        id="job-sort"
                        className={`${inputClass} mt-0`}    
                        value={ui.sort}
                        onChange={(e) => setFilters({ sort: e.target.value as SortKey })}
                    >
                        {SORT_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                    </select>
                </div>
                <button
                    type="button"
                    className={`${secondaryButton} lg:hidden`}
                    aria-expanded={showFilters}
                    onClick={() => setShowFilters((s) => !s)}
                >
                    Filters{activeCount > 0 ? ` (${activeCount})` : ""}
                </button>
            </div>

            <div className="grid gap-6 lg:grid-cols-[16rem_1fr]">
                <div className={showFilters ? "block" : "hidden lg:block"}>
                    <JobFilters
                        filters={ui}
                        facets={facets.data}
                        activeCount={activeCount}
                        onChange={setFilters}
                        onClear={handleClear}
                    />
                </div>

                <section aria-label="Results" className="space-y-3">
                    {jobs.isPending ? (
                        <div role="status" aria-live="polite" className="space-y-3">
                            {[0, 1, 2].map((i) => (
                                <div key={i} className="h-36 animate-pulse rounded-lg bg-stone-100 dark:bg-stone-800" />
                            ))}
                            <span className="sr-only">Loading jobs</span>
                        </div>
                    ): jobs.isError ? (
                        <div role="alert" className="space-y-3 rounded-lg border border-red-300 p-4 text-sm dark:border-red-900">
                            <p className="text-red-800 dark:text-red-200">{friendlyMessage(jobs.error)}</p>
                            <button type="button" className={secondaryButton} onClick={() => jobs.refetch()} disabled={jobs.isFetching}>
                                {jobs.isFetching ? "Trying again…" : "Try again"}
                            </button>
                        </div>
                    ) : jobs.data.items.length === 0 ? (
                            <div className="space-y-3 rounded-lg border border-stone-200 p-6 text-center dark:border-stone-800">
                            <p className="text-stone-700 dark:text-stone-300">No jobs match these filters.</p>
                            {(activeCount > 0 || ui.q) && (
                                <button type="button" className={secondaryButton} onClick={handleClear}>
                                Clear filters
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            <p aria-live="polite" className="text-sm text-stone-600 dark:text-stone-400">
                                {count} {count === 1 ? "job" : "jobs"}
                                {jobs.isFetching && " · updating…"}
                            </p>
                            <ul className={`space-y-3 transition-opacity ${jobs.isFetching ? "opacity-60" : ""}`}>
                                {jobs.data.items.map((job) => (
                                    <li key={job.id}>
                                        <JobCard
                                            job={job}
                                            href={`/jobs/${job.id}`}
                                            companyHref={`/companies/${job.company.id}`}
                                            isSaved={savedIds.data?.has(job.id) ?? false}
                                            isApplied={appliedIds.data?.has(job.id) ?? false}
                                            // only candidates can save; for recruiters the bookmark is not shown
                                            onToggleSave={
                                                isCandidate
                                                ? (jobId, next) => toggleSave.mutate({ jobId, save: next })
                                                : undefined
                                            }
                                        />
                                    </li>
                                ))}
                            </ul>
                            <Pagination page={ui.page} totalPages={totalPages} onPageChange={(page) => setFilters({ page })} />
                        </>
                    )}
                </section>
            </div>
        </main>
    )
}

export default function JobsPage() {
    return (
        <Suspense>
            <JobsView />
        </Suspense>
    );
}