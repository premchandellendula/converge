import type { Role } from "@/lib/auth";
import { request } from "@/lib/request";

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

// "Who am I?" stays in lib/auth.ts as the useMe() hook.
export const authApi = {
    signup: (body: SignupBody) =>
        request<{ user: AuthUser }>("/auth/signup", { method: "POST", body: JSON.stringify(body) }),

    login: (body: LoginBody) =>
        request<{ user: AuthUser }>("/auth/login", { method: "POST", body: JSON.stringify(body) }),

    logout: () => request<null>("/auth/logout", { method: "POST" }),
};