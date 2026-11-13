import { ApiError } from "@/lib/request";
import { authProvider } from "@/providers/authProvider";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { Alert, FieldError, inputClass, labelClass, primaryButton } from "../ui";
import { friendlyMessage } from "@/lib/notify";
import Link from "next/link";

export function ResetPasswordForm({ token }: { token: string}) {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [show, setShow] = useState(false);
    const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({})

    const reset = useMutation<unknown, ApiError, string>({
        mutationFn: (value) => authProvider.resetPassword({ token, password: value }),
        onSuccess: () => {
            toast.success("Password updated. Log in with your new password.");
            router.replace("/login");
        }
    })

    function handleSubmit(e: FormEvent<HTMLFormElement>){
        e.preventDefault();
        if(reset.isPending) return;

        const found: typeof errors = {};
        if(password.length < 8) found.password = "Use at least 8 characters";
        else if (password.length > 72) found.password = "Use 72 characters or fewer";
        if(confirm !== password) found.confirm = "The passwords don't match";
        setErrors(found);
        if(found.password) return void document.getElementById("reset-password")?.focus();
        if(found.confirm) return void document.getElementById("reset-confirm")?.focus();

        reset.mutate(password);
    }

    return (
        <form onSubmit={handleSubmit} noValidate className="w-full max-w-md space-y-5">
            <div>
                <h1 className="text-2xl font-semibold text-stone-900 dark:text-stone-50">Choose a new password</h1>
                <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">You&apos;ll be signed out of all devices.</p>
            </div>
            {reset.error && (
                <Alert>
                    {friendlyMessage(reset.error)}{" "}
                    {reset.error.status === 400 && (
                        <Link href="/forgot-password" className="font-medium underline">Ask for a new link</Link>
                    )}
                </Alert>
            )}

            <div>
                <label htmlFor="reset-password" className={labelClass}>New password</label>
                <div className="relative">
                    <input 
                        id="reset-password"
                        type={show ? "text" : "password"} 
                        autoComplete="new-password"
                        className={`${inputClass} pr-16`}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        aria-invalid={Boolean(errors.password)}
                        aria-describedby={errors.password ? "reset-password-error" : "reset-password-hint"}
                    />
                    <button
                        type="button"
                        onClick={() => setShow((s) => !s)}
                        aria-pressed={show}
                        className="absolute inset-y-0 right-2 my-1 rounded px-2 text-xs font-medium text-stone-600 hover:text-stone-900 focus-visible:outline-2 focus-visible:outline-purple-600 dark:text-stone-400 dark:hover:text-stone-50"
                    >
                        {show ? "Hide" : "Show"}
                    </button>
                </div>
                {errors.password ? (
                    <FieldError id="reset-password-error" message={errors.password} />
                ) : (
                    <p id="reset-password-hint" className="mt-1 text-xs text-stone-500 dark:text-stone-400">At least 8 characters.</p>
                )}
            </div>

            <div>
                <label htmlFor="reset-confirm" className={labelClass}>Confirm new password</label>
                <input 
                    id="reset-confirm"
                    type={show ? "text" : "password"}
                    autoComplete="new-password"
                    className={inputClass}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    aria-invalid={Boolean(errors.confirm)}
                    aria-describedby={errors.confirm ? "reset-confirm-error" : undefined}
                />
                <FieldError id="reset-confirm-error" message={errors.confirm} />
            </div>
            <button type="submit" disabled={reset.isPending} className={`${primaryButton} w-full`}>
                {reset.isPending ? "Saving…" : "Update password"}
            </button>
        </form>
    )
}