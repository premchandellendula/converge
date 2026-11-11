import Link from "next/link";
import ConvergeLogo from "@/app/components/logo/logo";

export function PublicHeader() {
    return (
        <header className="sticky top-0 z-40 border-b border-stone-300 bg-stone-200/90 text-stone-900 backdrop-blur dark:border-stone-700 dark:bg-stone-800/90 dark:text-stone-100">
            <nav aria-label="Main" className="flex h-14 w-full items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
                <ConvergeLogo href="/" />
                <div className="flex items-center gap-2">
                    <Link
                        href="/login"
                        className="rounded-md px-3 py-2 text-sm font-medium hover:bg-stone-300/60 focus-visible:outline-2 focus-visible:outline-purple-600 dark:hover:bg-stone-700"
                    >
                        Log in
                    </Link>
                    <Link
                        href="/signup"
                        className="rounded-md bg-purple-700 px-3 py-2 text-sm font-semibold text-white hover:bg-purple-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-700"
                    >
                        Sign up
                    </Link>
                </div>
            </nav>
        </header>
    );
}