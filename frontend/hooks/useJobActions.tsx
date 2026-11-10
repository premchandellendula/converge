import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { dataProvider, queryKeys } from "@/providers/dataProvider";
import { MyApplicationItem, SavedJobItem } from "@/lib/types";

// Same queries the jobs list page uses, so both pages share one cache.

export function useSavedJobIds(enabled: boolean) {
    return useQuery({
        queryKey: queryKeys.savedJobs.ids,
        queryFn: async () => {
            const { items } = await dataProvider.listSavedJobs<SavedJobItem>({ page: 1, limit: 50 });
            return new Set(items.map((s) => s.job.id));
        },
        enabled,
        staleTime: 60_000,
    });
}

export function useAppliedJobIds(enabled: boolean) {
    return useQuery({
        queryKey: queryKeys.applications.ids,
        queryFn: async () => {
            const { items } = await dataProvider.listMyApplications<MyApplicationItem>(1, 50);
            return new Map(
                items
                    .filter((a) => a.status !== "WITHDRAWN")
                    .map((a) => [a.job.id, { id: a.id, status: a.status }] as const),
            );
        },
        enabled,
        staleTime: 60_000,
    });
}

export function useToggleSave() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ jobId, save }: { jobId: number; save: boolean }) =>
            save ? dataProvider.saveJob(jobId) : dataProvider.unsaveJob(jobId),
        onMutate: async ({ jobId, save }) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.savedJobs.ids });
            const previous = queryClient.getQueryData<Set<number>>(queryKeys.savedJobs.ids);
            queryClient.setQueryData<Set<number>>(queryKeys.savedJobs.ids, (old) => {
                const next = new Set(old ?? []);
                if (save) next.add(jobId);
                else next.delete(jobId);
                return next;
            });
            return { previous };
        },
        onError: (_error, _variables, context) => {
            if (context?.previous) queryClient.setQueryData(queryKeys.savedJobs.ids, context.previous);
        },
        onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.savedJobs.all }),
    });
}