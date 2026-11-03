import { AuthGuard } from "@/app/components/auth/AuthGuard";
import type { ReactNode } from "react";

export default function RecruiterOnboardingLayout({ children }: { children: ReactNode }) {
    return <AuthGuard allow="Recruiter" profile="none">{children}</AuthGuard>;
}