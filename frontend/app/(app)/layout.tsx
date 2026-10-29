import { ReactNode } from "react";
import { AuthGuard } from "../components/auth/AuthGuard";

export default function AppLayout({ children }: { children: ReactNode }){
    return (
        <AuthGuard allow="authenticated">
            {children}
        </AuthGuard>
    )
}