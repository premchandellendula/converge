import { Role, useMe } from "@/lib/auth";
import { friendlyMessage } from "@/lib/notify";
import { homeFor, landingFor } from "@/providers/authProvider";
import { usePathname } from "next/navigation";
import { useRouter } from "next/router";
import { ReactNode, useEffect } from "react";

export function AuthGuard({
    allow,
    profile = "required",
    children
}: {
    allow: "guest" | "authenticated" | Role,
    profile?: "required" | "none" | "any",
    children: ReactNode
}) {
    const router = useRouter();
    const pathname = usePathname();
    const { data: me, isPending, error, refetch, isFetching } = useMe();

    let redirectTo: string | null = null;

    if (!isPending && !error) {
        if(!me){
            if(allow !== "guest") redirectTo = `/login?next=${encodeURIComponent(pathname ?? "/")}`
        }else if(allow === "guest"){
            redirectTo = landingFor(me);
        }else if (allow !== "authenticated" && me.role !== allow){
            redirectTo = landingFor(me);
        }else if(profile === "required" && !me.hasProfile){
            redirectTo = "/onboarding"
        }else if(profile === "none" && me.hasProfile){
            redirectTo = homeFor(me.role)
        }
    }
    
    useEffect(() => {
        if(redirectTo) router.replace(redirectTo)
    }, [redirectTo, router])

    if(isPending || redirectTo){
        return (
            <div role="status" aria-live="polite" className="grid min-h-[50vh] place-items-center text-sm text-stone-500">
                Loading...
            </div>
        )
    }

    if (error) {
        return (
            <div role="alert" className="mx-auto grid min-h-[50vh] max-w-sm place-items-center gap-3 text-center">
                <p className="text-sm text-stone-700 dark:text-stone-300">{friendlyMessage(error)}</p>
                <button type="button" onClick={() => refetch()} disabled={isFetching}>
                {isFetching ? "Trying again…" : "Try again"}
                </button>
            </div>
        );
    }

    return <>{children}</>
}