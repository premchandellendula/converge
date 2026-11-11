"use client";
import { useMe } from "@/lib/auth";
import Navbar from "../nav/Navbar";
import { LoggedOutLanding } from "./LoggedOutLanding";
import { PublicHeader } from "./PublicHeader";
import { Footer } from "./Footer";
import { RecruiterHome } from "./RecruiterHome";
import { CandidateHome } from "./CandidateHome";

export function Landing() {
    const { data: me, isPending } = useMe();

    if(isPending){
        return (
            <div role="status" aria-live="polite" className="min-h-screen">
                <div className="h-14 border-b border-stone-200 dark:border-stone-800" />
                <div className="mx-auto max-w-5xl space-y-4 p-6">
                    <div className="h-10 w-2/3 animate-pulse rounded-lg bg-stone-100 dark:bg-stone-800" />
                    <div className="h-40 animate-pulse rounded-xl bg-stone-100 dark:bg-stone-800" />
                </div>
                <span className="sr-only">Loading</span>
            </div>
        )
    }

    if(!me){
        return (
            <>
                <PublicHeader />
                <main>
                    <LoggedOutLanding />
                </main>
                <Footer />
            </>
        )
    }

    return (
        <>
            <Navbar />
            <main>{me.role === "Recruiter" ? <RecruiterHome me={me} /> : <CandidateHome me={me} />}</main>
            <Footer />
        </>
    )
}