import { EXPERIENCE_BUCKETS, JOB_TYPE_OPTIONS, POSTED_OPTIONS, SALARY_BUCKETS, UiFilters, WORK_MODE_OPTIONS } from "@/lib/jobFilters";
import { FacetOption, JobFacets } from "@/lib/types";
import { ReactNode, useState } from "react";

const toggle = <T,>(list: T[], value: T): T[] => (list.includes(value)) ? list.filter((x) => x !== value) : [...list, value];

const countOf = (options: FacetOption[] | undefined, value: string) => options ? (options.find((o) => o.value === value)?.count ?? 0) : undefined;

function Group({ title, children }: { title: string, children: ReactNode }){
    return (
        <fieldset className="border-t border-stone-200 pt-4 first:border-0 first:pt-0 dark:border-stone-800">
            <legend className="border-t border-stone-200 pt-4 first:border-0 first:pt-0 dark:border-stone-800">{title}</legend>
            <div className="space-y-1.5">{children}</div>
        </fieldset>
    )
}

function Row({
    type,
    name,
    checked,
    onChange,
    label,
    count
}: {
    type: "checkbox" | "radio";
    name: string;
    checked: boolean;
    onChange: () => void;
    label: string;
    count?: number
}) {
    return (
        <label className="flex cursor-pointer items-center gap-2 text-sm text-stone-700 dark:text-stone-300">
            <input type={type} name={name} checked={checked} onChange={onChange} className="h-4 w-4 accent-purple-700" />
            <span className="flex-1">{label}</span>
            {count !== undefined && <span className="text-xs tabular-nums text-stone-50 dark:text-stone-400">{count}</span>}
        </label>
    )
}

const visible = (count: number | undefined, selected: boolean) => count === undefined || count > 0 || selected;

export function JobFilters({
    filters,
    facets,
    activeCount,
    onChange,
    onClear
}: {
    filters: UiFilters,
    facets: JobFacets | undefined;
    activeCount: number;
    onChange: (path: Partial<UiFilters>) => void;
    onClear: () => void;
}) {
    const [showAllLocations, setShowAllLocations] = useState(false);

    const locations: FacetOption[] = [
        ...(facets?.location ?? []),
        ...filters.location.filter((l) => !facets?.location.some((o) => o.value === l)).map((value) => ({ value, count: 0}))
    ].filter((o) => visible(facets ? o.count : undefined, filters.location.includes(o.value)));
    const shownLocations = showAllLocations ? locations : locations.slice(0, 8);

    return (
        <aside aria-label="Filters" className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-stone-900 dark:text-stone-50">Filters</h2>
                {activeCount > 0 && (
                    <button
                        type="button"
                        onClick={onClear}
                        className="text-sm font-medium text-purple-700 hover:underline dark:text-purple-400"
                    >
                        Clear all ({activeCount})
                    </button>
                )}
            </div>

            <Group title="Work Mode">
                {WORK_MODE_OPTIONS.map((o) => {
                    const count = countOf(facets?.workMode, o.value);
                    const checked = filters.workMode.includes(o.value);
                    if(!visible(count, checked)) return null;
                    return (
                        <Row key={o.value} type="checkbox" name="workMode" label={o.label} count={count} checked={checked} onChange={() => onChange({ workMode: toggle(filters.workMode, o.value) })} />
                    )
                })}
            </Group>

            <Group title="Job type">
                {JOB_TYPE_OPTIONS.map((o) => {
                    const count = countOf(facets?.jobType, o.value);
                    const checked = filters.jobType.includes(o.value);
                    if (!visible(count, checked)) return null;
                    return (
                        <Row key={o.value} type="checkbox" name="jobType" label={o.label} count={count} checked={checked}
                        onChange={() => onChange({ jobType: toggle(filters.jobType, o.value) })} />
                    );
                })}
            </Group>
            <Group title="Experience">
                <Row type="radio" name="exp" label="Any" checked={filters.exp === null} onChange={() => onChange({ exp: null })} />
                {EXPERIENCE_BUCKETS.map((b) => {
                    const count = countOf(facets?.experience, b.key);
                    const checked = filters.exp === b.key;
                    if (!visible(count, checked)) return null;
                    return <Row key={b.key} type="radio" name="exp" label={b.label} count={count} checked={checked} onChange={() => onChange({ exp: b.key })} />;
                })}
            </Group>

            <Group title="Salary">
                <Row type="radio" name="salary" label="Any" checked={filters.salary === null} onChange={() => onChange({ salary: null })} />
                {SALARY_BUCKETS.map((b) => {
                    const count = countOf(facets?.salary, b.key);
                    const checked = filters.salary === b.key;
                    if (!visible(count, checked)) return null;
                    return <Row key={b.key} type="radio" name="salary" label={b.label} count={count} checked={checked} onChange={() => onChange({ salary: b.key })} />;
                })}
            </Group>

            <Group title="Date posted">
                <Row type="radio" name="posted" label="Any time" checked={filters.postedWithin === null} onChange={() => onChange({ postedWithin: null })} />
                {POSTED_OPTIONS.map((o) => {
                    const count = countOf(facets?.postedWithin, String(o.value));
                    const checked = filters.postedWithin === o.value;
                    if (!visible(count, checked)) return null;
                    return <Row key={o.value} type="radio" name="posted" label={o.label} count={count} checked={checked} onChange={() => onChange({ postedWithin: o.value })} />;
                })}
            </Group>

            {locations.length > 0 && (
                <Group title="Location">
                    {shownLocations.map((o) => (
                        <Row key={o.value} type="checkbox" name="location" label={o.value} count={facets ? o.count : undefined}
                        checked={filters.location.includes(o.value)}
                        onChange={() => onChange({ location: toggle(filters.location, o.value) })} />
                    ))}
                    {locations.length > 8 && (
                        <button type="button" onClick={() => setShowAllLocations((s) => !s)}
                        className="text-sm font-medium text-purple-700 hover:underline dark:text-purple-400">
                        {showAllLocations ? "Show fewer" : `Show all ${locations.length}`}
                        </button>
                    )}
                </Group>
            )}
        </aside>
    )
}