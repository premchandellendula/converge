import { ReactNode } from "react";
import { AuthGuard } from "../components/auth/AuthGuard";

export default function AuthLayout({ children }: { children: ReactNode }){
    return (
        <AuthGuard allow="guest">
            <main className="grid min-h-screen place-items-center p-6">{children}</main>
        </AuthGuard>
    )
}