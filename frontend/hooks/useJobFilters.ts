import { EMPTY_FILTERS, parseFilters, toApiFilters, toSearchParams, UiFilters } from "@/lib/jobFilters";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

export function useJobFilters(){
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const queryString = searchParams.toString();

    const ui = useMemo(() => parseFilters(new URLSearchParams(queryString)), [queryString]);
    const api = useMemo(() => toApiFilters(ui), [ui]);

    const replaceUrl = useCallback(
        (next: UiFilters) => {
            const qs = toSearchParams(next).toString();
            router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
        },
        [router, pathname],
    );

    const setFilters = useCallback((patch: Partial<UiFilters>) => replaceUrl({ ...ui, page: 1, ...patch }), [ui, replaceUrl]);

    const clearAll = useCallback(() => replaceUrl({ ...EMPTY_FILTERS, sort: ui.sort }), [ui.sort, replaceUrl]);

    return { ui, api, setFilters, clearAll };
}