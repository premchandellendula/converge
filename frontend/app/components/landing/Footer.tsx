import Link from "next/link";
import ConvergeLogo from "@/app/components/logo/logo";

export function Footer() {
    return (
        <footer className="mt-16 border-t border-stone-200 dark:border-stone-800">
            <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-8 text-sm text-stone-600 dark:text-stone-400 sm:px-6">
                <div className="flex items-center gap-3 text-stone-900 dark:text-stone-100">
                    <ConvergeLogo href="/" size={20} />
                </div>
                <nav aria-label="Footer" className="flex items-center gap-5">
                    <Link href="/login" className="hover:underline">Log in</Link>
                    <Link href="/signup" className="hover:underline">Sign up</Link>
                </nav>
                <p>© {new Date().getFullYear()} Converge</p>
            </div>
        </footer>
    );
}