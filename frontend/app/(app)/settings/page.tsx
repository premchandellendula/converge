"use client";

import { Alert, secondaryButton } from "@/app/components/ui";
import { useMe } from "@/lib/auth";
import { friendlyMessage } from "@/lib/notify";
import { ApiError } from "@/lib/request";
import { authProvider } from "@/providers/authProvider";
import { useMutation } from "@tanstack/react-query";
import { ReactNode } from "react";
import { toast } from "sonner";

function Card({ id, title, children }: { id: string; title: string; children: ReactNode }) {
    return (
        <section aria-labelledby={id} className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900 sm:p-6">
            <h2 id={id} className="mb-4 text-lg font-semibold text-stone-900 dark:text-stone-50">{title}</h2>
            {children}
        </section>
    )
}

export default function SettingsPage(){
    const { data: me } = useMe();

    const resend = useMutation<unknown, ApiError, void>({
        mutationFn: () => authProvider.resendVerification(),
        onSuccess: () => toast.success("Verification email sent. Check your inbox."),
        onError: (error) => toast.error(friendlyMessage(error))
    })

    const changePassword = useMutation<unknown, ApiError, string>({
        mutationFn: (email) => authProvider.forgotPassword(email),
    })

    if(!me) return null;

    return (
        <main className="mx-auto w-full max-w-2xl space-y-5 p-6">
            <h1 className="text-2xl font-semibold text-stone-900 dark:text-stone-50">Settings</h1>

            <Card id="settings-account" title="Account">
                <dl className="space-y-4">
                    <div>
                        <dt className="text-xs text-stone-50 dark:text-stone-400">Name</dt>
                        <dd className="mt-0.5 text-sm font-medium text-stone-900 dark:text-stone-100">{me.firstName} {me.lastName}</dd>
                    </div>
                    <div>
                        <dt className="text-xs text-stone-50 dark:text-stone-400">Email</dt>
                        <dd className="mt-0.5 flex flex-wrap items-center gap-3 text-sm font-medium text-stone-900 dark:text-stone-100">
                            <span className="break-all">{me.email}</span>
                            {me.isEmailVerified ? (
                                <span className="rounded-md bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-950 dark:text-green-200">Verified</span>
                            ): (
                                <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900 dark:bg-amber-950 dark:text-amber-200">Not verified</span> 
                            )}
                        </dd>
                    </div>
                </dl>
                {!me.isEmailVerified && (
                    <div className="mt-4 space-y-2">
                        <p className="text-sm text-stone-600 dark:text-stone-400">
                            Confirm your email so we can reach you about your account.
                        </p>
                        <button type="button" className={secondaryButton} onClick={() => resend.mutate()} disabled={resend.isPending}>
                            {resend.isPending ? "Sending…" : "Resend verification email"}
                        </button>
                    </div>
                )}
            </Card>

            <Card id="settings-security" title="Security">
                <p className="text-sm text-stone-600 dark:text-stone-400">
                    To change your password, we&apos;ll email a link to <strong>{me.email}</strong>. Opening it lets you choose a new password, and you&apos;ll be signed out of all your devices.
                </p>

                {changePassword.error && (
                    <div className="mt-3">
                        <Alert>{friendlyMessage(changePassword.error)}</Alert>
                    </div>
                )}

                {changePassword.isSuccess ? (
                    <p role="status" className="mt-4 text-sm font-medium text-green-700 dark:text-green-400">
                        Done. Check your inbox for the link. It works for one hour.
                    </p>
                ) : (
                    <button
                        type="button"
                        className={`${secondaryButton} mt-4`}
                        onClick={() => changePassword.mutate(me.email)}
                        disabled={changePassword.isPending}
                    >
                        {changePassword.isPending ? "Sending…" : "Email me a link to change my password"}
                    </button>
                )}
            </Card>
        </main>
    )
}