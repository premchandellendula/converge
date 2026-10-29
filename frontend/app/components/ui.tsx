export const inputClass =
    "mt-1 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 " +
    "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-purple-600 " +
    "aria-[invalid=true]:border-red-600 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-50";

export const labelClass = "block text-sm font-medium text-stone-800 dark:text-stone-200";

export const primaryButton =
    "rounded-md bg-purple-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-800 " +
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-700 " +
    "disabled:cursor-not-allowed disabled:opacity-60";

export const secondaryButton =
    "rounded-md border border-stone-300 px-4 py-2 text-sm font-medium text-stone-800 hover:bg-stone-100 " +
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 " +
    "disabled:cursor-not-allowed disabled:opacity-60 dark:border-stone-700 dark:text-stone-100 dark:hover:bg-stone-800";

export function FieldError({ id, message }: { id: string, message?: string }){
    if(!message) return null;

    return (
        <p id={id} className="mt-1 text-sm text-red-700 dark:text-red-400">
            {message}  
        </p>
    )
}

export function Alert({ children }: { children: React.ReactNode }) {
    return (
        <div
            role="alert"
            className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
        >
            {children}
        </div>
    );
}