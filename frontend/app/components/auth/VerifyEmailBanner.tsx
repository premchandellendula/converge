"use client";

import { useMe } from "@/lib/auth";
import { friendlyMessage } from "@/lib/notify";
import { ApiError } from "@/lib/request";
import { authProvider } from "@/providers/authProvider";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export function VerifyEmailBanner(){
    const { data: me } = useMe();

    const resend = useMutation<{ message?: string } | null, ApiError, void>({
        mutationFn: () => authProvider.resendVerification(),
        onSuccess: () => toast.success("Verification email sent. Check your inbox."),
        onError: (error) => toast.error(friendlyMessage(error))
    })

    if (!me || me.isEmailVerified) return null;

    return (
        <div role="status" className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-b border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
            <span>Please confirm your email address ({me.email}). We sent you a link.</span>
            <button
                type="button"
                onClick={() => resend.mutate()}
                disabled={resend.isPending}
                className="font-semibold underline underline-offset-2 hover:no-underline disabled:opacity-60"
            >
                {resend.isPending ? "Sending…" : "Resend email"}
            </button>
        </div>
    );
}