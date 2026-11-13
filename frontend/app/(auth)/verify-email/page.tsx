import { VerifyEmail } from "@/app/components/auth/VerifyEmail";

export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ token?: string }> }){
    const { token } = await searchParams;

    return (
        <main className="grid min-h-[70vh] place-items-center p-6">
            <div className="w-full max-w-md">
                <VerifyEmail token={token ?? ""} />
            </div>
        </main>
    )
}