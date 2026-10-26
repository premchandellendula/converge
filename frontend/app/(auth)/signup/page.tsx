"use client";

import { SignupForm } from "@/app/components/auth/SignupForm";
import { useRouter } from "next/navigation";

export default function Signup() {
    const router = useRouter();
    return (
        <main className="grid min-h-screen place-items-center p-6">
            <SignupForm onSuccess={() => router.push("/onboarding")} />
        </main>
    );
}