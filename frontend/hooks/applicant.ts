import { dataProvider } from "@/providers/dataProvider";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export function useMyApplications(page = 1, limit = 10){
    return useQuery({
        queryKey: queryKeys.applications.mine(page, limit),
        queryFn: () => dataProvider.listMyApplications(page, limit),
        placeholderData: keepPreviousData
    })
}

export function useAppliedJobIds(enabled: boolean){
    return useQuery({
        queryKey: queryKeys.applications.ids,
        queryFn: async () => {
            const { items } = await dataProvider.listMyApplications(1, 50);
            return new Set(items.map((a) => a.job.id));
        },
        enabled,
        staleTime: 60_000
    })
}