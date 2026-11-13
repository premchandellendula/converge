import { ApiError } from "@/lib/request";
import { authProvider } from "@/providers/authProvider";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { Alert, FieldError, inputClass, labelClass, primaryButton } from "../ui";
import { friendlyMessage } from "@/lib/notify";

export function ForgotPasswordForm() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");

    const send = useMutation<unknown, ApiError, string>({
        mutationFn: (value) => authProvider.forgotPassword(value)
    })

    function handleSubmit(e: FormEvent<HTMLFormElement>){
        e.preventDefault();
        if(send.isPending) return;
        if(!/^\S+@\S+\.\S+$/.test(email.trim())){
            setError("Enter a valid email address");
            document.getElementById("forgot-email")?.focus();
            return;
        }

        setError("");
        send.mutate(email.trim());
    }

    if(send.isSuccess){
        return (
            <div role="status" className="w-full max-w-md space-y-4">
                <h1 className="text-2xl font-semibold text-stone-900 dark:text-stone-50">Check your email</h1>
                <p className="text-sm text-stone-700 dark:text-stone-300">
                    If an account exists for <strong>{email.trim()}</strong>, we&apos;ve sent a linkg to reset your password. It works for one hour. Check your spam folder if you don&apos;t see it.
                </p>
                <Link href="/login" className="inline-block text-sm font-medium text-purple-700 hover:underline dark:text-purple-400">
                Back to log in</Link>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} noValidate className="w-full max-w-md space-y-5">
            <div>
                <h1 className="text-2xl font-semibold text-stone-900 dark:text-stone-50">Forgot your password?</h1>
            </div>
            {send.error && <Alert>{friendlyMessage(send.error)}</Alert>}

            <div>
                <label htmlFor="forgot-email" className={labelClass}>Email</label>
                <input 
                    id="forgot-email"
                    type="email"
                    autoComplete="email"
                    className={inputClass}
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        if(error) setError("")
                    }}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? "forgot-email-error" : undefined}
                /> 
                <FieldError id="forgot-email-error" message={error} /> 
            </div>

            <button type="submit" disabled={send.isPending} className={`${primaryButton} w-full`}>
                {send.isPending ? "Sending…" : "Send reset link"}
            </button>

            <p className="text-center text-sm text-stone-600 dark:text-stone-400">
                <Link href="/login" className="font-medium text-purple-700 hover:underline dark:text-purple-400">Back to log in</Link>
            </p>
        </form>
    )
}