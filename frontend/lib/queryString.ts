/**
 * toQueryString({ q: "node", jobType: ["FULL_TIME", "CONTRACT"], page: 2, expMin: undefined })
 *   → "?q=node&jobType=FULL_TIME%2CCONTRACT&page=2"
 *
 * Empty values (undefined, null, "", empty arrays) are left out. Arrays become one comma-separated value,
 * which is the format the backend's filter schema expects.
 */
export function toQueryString(params: object): string {
    const search = new URLSearchParams();

    for (const [key, value] of Object.entries(params as Record<string, unknown>)) {
        if (value === undefined || value === null || value === "") continue;
        if (Array.isArray(value)) {
            if (value.length > 0) search.set(key, value.join(","));
        } else {
            search.set(key, String(value));
        }
    }

    const query = search.toString();
    return query ? `?${query}` : "";
}