import { useQuery } from "@tanstack/react-query";
import { ApiError, request } from "./request";

export type Role = "Candidate" | "Recruiter";
export interface Me {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    role: Role,
    isEmailVerified: boolean;
    hasProfile: boolean;
}

export const meKey = ["me"] as const;

export function useMe(){
    return useQuery<Me | null, ApiError>({
        queryKey: meKey,
        queryFn: async () => {
            try {
                return await request("/auth/me");
            } catch (error) {
                if(error instanceof ApiError && error.status === 401) return null;
                throw error;
            }
        },
        staleTime: 5 * 60_000
    })
}