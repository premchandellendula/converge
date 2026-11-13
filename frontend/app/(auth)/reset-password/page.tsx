import { ResetPasswordForm } from "@/app/components/auth/ResetPasswordForm";

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }){
    const { token } = await searchParams;

    return (
        <main className="grid min-h-[70vh] place-items-center p-6">
            {token ? (
                <ResetPasswordForm token={token} />
            ): (
                <p role="alert" className="text-stone-700 dark:text-stone-300">
                    This link is missing its token. Open the link from your email again, or{" "}
                    <a href="/forgot-password" className="font-medium text-purple-700 underline dark:text-purple-400">ask for a new one</a>.
                </p>
            )}
        </main>
    )
}