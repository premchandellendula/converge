"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const primary = "inline-block rounded-md bg-purple-700 px-5 py-3 text-sm font-semibold text-white hover:bg-purple-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-700"

const secondary =
    "inline-block rounded-md border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-900 hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-700 dark:border-stone-700 dark:text-stone-50 dark:hover:bg-stone-800";

const FOR_CANDIDATES = [
    "Build one profile and reuse it for every application",
    "Apply in one click, with no long forms",
    "Save jobs and filter by skills, salary and location",
    "Follow each application from applied to hired",
];

const FOR_RECRUITERS = [
    "Post a job in a few minutes",
    "See at a glance how well each applicant's skills match",
    "Shortlist, interview and hire from one pipeline",
    "Close or reopen a job whenever you need",
];

const STEPS = {
    candidate: [
        { title: "Create your profile", text: "Add your education, skills and experience once. A resume is optional." },
        { title: "Apply in one click", text: "Find a job you like and apply. Recruiters see your whole profile." },
        { title: "Track your progress", text: "Watch each application move from applied to shortlisted, interview and hired." },
    ],
    recruiter: [
        { title: "Set up your company", text: "Tell candidates who you are, then post your first job." },
        { title: "Review applicants", text: "Browse applicants with their skill match, experience and expected salary." },
        { title: "Move people forward", text: "Shortlist, schedule interviews, reject or hire. Candidates see every update." },
    ],
} as const;

function Bullets({ items }: { items: readonly string[] }) {
    return (
        <ul className="mt-4 space-y-3">
            {items.map((text) => (
                <li key={text} className="flex items-start gap-3 text-sm text-stone-700 dark:text-stone-300">
                    <Check size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-purple-700 dark:text-purple-400" />
                    {text}
                </li>
            ))}
        </ul>
    )
}

function PreviewCard() {
    const steps = ["Applied", "Shortlisted", "Interview", "Hired"];

    return (
        <div aria-hidden="true" className="mx-auto w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-5 shadow-lg dark:border-stone-700 dark:bg-stone-900">
            <div className="flex items-start gap-3">
                <div className="grid size-11 place-items-center rounded-lg bg-purple-100 text-lg font-semibold text-purple-800 dark:bg-purple-900 dark:text-purple-200">A</div>
                <div className="flex-1">
                    <p className="text-sm font-semibold text-stone-900 dark:text-stone-50">Frontend Developer</p>
                    <p className="text-xs text-stone-600 dark:text-stone-400">Sample Company · Hyderabad</p>
                </div>
                <span className="rounded-md bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800 dark:bg-purple-950 dark:text-purple-200">Interview</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5">
                {["React", "TypeScript", "CSS"].map((s) => (
                    <span key={s} className="rounded-md bg-stone-100 px-2 py-0.5 text-xs text-stone-700 dark:bg-stone-800 dark:text-stone-300">{s}</span>
                ))}
            </div>
            <ol className="mt-5 flex items-center">
                {steps.map((label, i) => (
                    <li key={label} className={`flex items-center ${i === steps.length - 1 ? "" : "flex-1"}`}>
                        <span className={`grid size-5 place-items-center rounded-full text-[10px] font-semibold ${i <= 2 ? "bg-teal-600 text-white" : "border border-stone-300 text-stone-400 dark:border-stone-700"}`}>
                            {i < 2 ? "✓" : i + 1}
                        </span>
                        {i < steps.length - 1 && <span className={`mx-2 h-0.5 flex-1 rounded-full ${i < 2 ? "bg-teal-600" : "bg-stone-200 dark:bg-stone-700"}`} />}
                    </li>
                ))}
            </ol>
            <p className="mt-3 text-xs text-stone-500 dark:text-stone-400">Applied 3 days ago</p>
        </div>
    )
}


export function LoggedOutLanding() {
    const [audience, setAudience] = useState<"candidate" | "recruiter">("candidate");

    return (
        <>
            {/* Hero */}
            <section className="mx-auto grid max-w-5xl items-center gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 md:py-20">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-stone-900 dark:text-stone-50 sm:text-5xl">
                        Find the right job. Hire the right people.
                    </h1>
                    <p className="mt-5 text-lg text-stone-600 dark:text-stone-400">
                        Converge brings candidates and recruiters together. Build your profile once, apply in one
                        click, and track every application in one place.
                    </p>
                    <div className="mt-8 flex flex-wrap items-center gap-3">
                        <Link href="/signup?role=candidate" className={primary}>Find a job</Link>
                        <Link href="/signup?role=recruiter" className={secondary}>Hire talent</Link>
                    </div>
                    <p className="mt-4 text-sm text-stone-600 dark:text-stone-400">
                        Already have an account?{" "}
                        <Link href="/login" className="font-medium text-purple-700 underline-offset-2 hover:underline dark:text-purple-400">Log in</Link>
                    </p>
                </div>
                <PreviewCard />
            </section>

            {/* Two audiences */}
            <section aria-labelledby="audiences" className="border-y border-stone-200 bg-stone-50 dark:border-stone-800 dark:bg-stone-900/40">
                <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
                    <h2 id="audiences" className="text-center text-2xl font-semibold text-stone-900 dark:text-stone-50">
                        Built for both sides of hiring
                    </h2>
                    <div className="mt-8 grid gap-6 md:grid-cols-2">
                        <div className="rounded-xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
                            <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-50">For job seekers</h3>
                            <Bullets items={FOR_CANDIDATES} />
                            <Link href="/signup?role=candidate" className={`${primary} mt-6`}>Create your profile</Link>
                        </div>
                        <div className="rounded-xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
                            <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-50">For recruiters</h3>
                            <Bullets items={FOR_RECRUITERS} />
                            <Link href="/signup?role=recruiter" className={`${secondary} mt-6`}>Start hiring</Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section aria-labelledby="how" className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
                <h2 id="how" className="text-center text-2xl font-semibold text-stone-900 dark:text-stone-50">How it works</h2>

                <div role="tablist" aria-label="How it works for" className="mx-auto mt-6 flex w-fit rounded-lg border border-stone-200 p-1 dark:border-stone-700">
                    {(["candidate", "recruiter"] as const).map((key) => (
                        <button
                            key={key}
                            type="button"
                            role="tab"
                            aria-selected={audience === key}
                            onClick={() => setAudience(key)}
                            className={`rounded-md px-4 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-purple-600 ${
                                audience === key
                                    ? "bg-purple-700 text-white"
                                    : "text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
                            }`}
                        >
                            {key === "candidate" ? "Job seekers" : "Recruiters"}
                        </button>
                    ))}
                </div>

                <ol className="mt-8 grid gap-6 md:grid-cols-3">
                    {STEPS[audience].map((step, i) => (
                        <li key={step.title} className="rounded-xl border border-stone-200 p-5 dark:border-stone-800">
                            <span className="grid size-8 place-items-center rounded-full bg-purple-100 text-sm font-semibold text-purple-800 dark:bg-purple-950 dark:text-purple-200">{i + 1}</span>
                            <h3 className="mt-3 text-base font-semibold text-stone-900 dark:text-stone-50">{step.title}</h3>
                            <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">{step.text}</p>
                        </li>
                    ))}
                </ol>
            </section>
 
            {/* Closing call to action */}
            <section className="mx-auto max-w-5xl px-4 sm:px-6">
                <div className="rounded-2xl bg-purple-700 px-6 py-12 text-center text-white">
                    <h2 className="text-2xl font-semibold sm:text-3xl">Ready to converge?</h2>
                    <p className="mx-auto mt-2 max-w-xl text-purple-100">Create a free account and be part of your next hire, or your next job.</p>
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                        <Link href="/signup?role=candidate" className="rounded-md bg-white px-5 py-3 text-sm font-semibold text-purple-800 hover:bg-purple-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                            Find a job
                        </Link>
                        <Link href="/signup?role=recruiter" className="rounded-md border border-purple-300 px-5 py-3 text-sm font-semibold text-white hover:bg-purple-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                            Hire talent
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}