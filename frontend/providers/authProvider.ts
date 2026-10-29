import { Me, Role } from "@/lib/auth";
import { ApiError, request } from "@/lib/request";

export interface AuthUser {
    id: string;
    role: Role;
}

export interface SignupBody {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    password: string;
    role: Role;
}

export interface LoginBody {
    email: string;
    password: string;
}

export const authProvider = {
    signup: (body: SignupBody) =>
        request<{ user: AuthUser }>("/users/signup", { method: "POST", body: JSON.stringify(body) }),

    login: (body: LoginBody) =>
        request<{ user: AuthUser }>("/users/login", { method: "POST", body: JSON.stringify(body) }),

    logout: () => request<null>("/users/logout", { method: "POST" }),

  /** The logged-in user, or null when nobody is logged in (a 401 here is an answer, not an error). */
    getIdentity: async (): Promise<Me | null> => {
        try {
            return await request<Me>("/users/me");
        } catch (error) {
            if (error instanceof ApiError && error.status === 401) return null;
            throw error;
        }
    },
};

/** Where each role lands after logging in. */
export function homeFor(role: Role): string {
    return role === "Recruiter" ? "/recruiter/jobs" : "/jobs";
}

/** Where a logged-in user belongs right now: onboarding until the profile exists, then home. */
export function landingFor(me: Me): string {
    return me.hasProfile ? homeFor(me.role) : "/onboarding";
}

/** Accepts only paths inside this site, so "?next=https://evil.example" can never redirect away. */
export function safeNext(next: string | null | undefined): string | null {
    return next && next.startsWith("/") && !next.startsWith("//") ? next : null;
}