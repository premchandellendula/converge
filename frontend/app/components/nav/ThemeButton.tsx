"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes"
import { useSyncExternalStore } from "react";

// There is nothing to subscribe to: the answer never changes after the page has loaded
const subscribe = () => () => {};

// false on the server and during hydration, true once the page is running in the browser
function useIsClient() {
    return useSyncExternalStore(
        subscribe,
        () => true,
        () => false
    );
}

const ThemeButton = () => {
    const { resolvedTheme, setTheme } = useTheme();
    const isClient = useIsClient();

    // The server does not know the user's theme, so it cannot draw the real button.
    // This empty box has the same size, so the navbar does not jump when the button appears.
    if (!isClient) return <div aria-hidden="true" className="h-7 w-14 shrink-0" />;
    const isDark = resolvedTheme === "dark";

    return (
        <button
            type="button"
            role="switch"
            aria-checked={isDark}
            aria-label="Toggle dark mode"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="relative h-7 w-14 shrink-0 cursor-pointer rounded-full border border-stone-300 bg-stone-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-stone-600 dark:bg-stone-700"
        >
            <Sun className="absolute left-1.5 top-1/2 size-3.5 -translate-y-1/2 text-amber-500" />
            <Moon className="absolute right-1.5 top-1/2 size-3.5 -translate-y-1/2 text-blue-300" />
            <span
                className={`absolute left-0.5 top-0.5 flex size-6 items-center justify-center rounded-full bg-white shadow transition-transform duration-200 ease-out dark:bg-stone-900 ${
                    isDark ? "translate-x-6.5" : "translate-x-0"
                }`}
            >
                {isDark ? (
                    <Moon className="size-3.5 text-blue-300" />
                ) : (
                    <Sun className="size-3.5 text-amber-500" />
                )}
            </span>
        </button>
    )
}

export default ThemeButton