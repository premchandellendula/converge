import { AuthGuard } from "@/app/components/auth/AuthGuard";
import type { ReactNode } from "react";

export default function RecruiterLayout({ children }: { children: ReactNode }) {
    return <AuthGuard allow="Recruiter">{children}</AuthGuard>;
}
