import { meKey } from "@/lib/auth";
import { friendlyMessage } from "@/lib/notify";
import { authProvider } from "@/providers/authProvider";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";

export function VerifyEmail({ token }: { token: string }) {
    const queryClient = useQueryClient();

    const verify = useQuery({
        queryKey: ["verify-email", token],
        queryFn: async () => {
            await authProvider.verifyEmail(token);
            await queryClient.invalidateQueries({ queryKey: meKey })
            return true;
        },
        enabled: Boolean(token),
        retry: false,
        staleTime: Infinity,
        refetchOnWindowFocus: false
    })

    if (!token) {
        return <p role="alert" className="text-stone-700 dark:text-stone-300">This link is missing its token. Open the link from your email again.</p>;
    }

    if (verify.isPending) {
        return <p role="status" aria-live="polite" className="text-stone-700 dark:text-stone-300">Verifying your email…</p>;
    }

    if(verify.isError){
        return (
            <div role="alert" className="space-y-3">
                <h1>We couldn&apos;t verify your email</h1>
                <p className="text-sm text-stone-700 dark:text-stone-400">{friendlyMessage(verify.error)}</p>
                <p>
                    Log in and use &quot;Resent email&quot; at the top of the page to get a fresh link.
                </p>
                <Link href={"/"} className="inline-block text-sm font-medium text-purple-700 hover:underline dark:text-purple-400">Go to the home page</Link>
            </div>
        )
    }

    return (
        <div role="status" className="space-y-3">
            <h1 className="text-2xl font-semibold text-stone-900 dark:text-stone-50">Email verified</h1>
            <p className="text-sm text-stone-700 dark:text-stone-300">Thanks! Your email address is confirmed.</p>
            <Link href="/" className="inline-block rounded-md bg-purple-700 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-800">Continue</Link>
        </div>
    );
}