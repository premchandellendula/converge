import { AuthGuard } from "@/app/components/auth/AuthGuard";
import type { ReactNode } from "react";

export default function CandidateLayout({ children }: { children: ReactNode }) {
    return <AuthGuard allow="Candidate">{children}</AuthGuard>;
}
