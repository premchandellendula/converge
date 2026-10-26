"use client";
import { LoginForm } from "@/app/components/auth/LoginForm";
import { useRouter } from "next/navigation";

export default function Login(){
    const router = useRouter();
    return (
        <main className="min-h-screen flex justify-center place-items-center p-6">
            <LoginForm onSuccess={() => router.push("/onboarding")} />
        </main>
    )
}