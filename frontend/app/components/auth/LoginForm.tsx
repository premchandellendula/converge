"use client";
import { meKey, Role } from "@/lib/auth";
import { friendlyMessage } from "@/lib/notify";
import { ApiError, request, ServerIssue } from "@/lib/request";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";

export interface LoginUser {
    id: string;
    role: Role;
}

interface LoginBody {
    email: string;
    password: string; 
}

type Field = "email" | "password";
type FieldErrors = Partial<Record<Field, string>>;

export interface LoginFormProps {
    onSuccess: (user: LoginUser) => void;
    singupHref?: string;
}

const FIELD_ORDER: Field[] = ["email", "password"];

function validate(values: Record<Field, string>): FieldErrors {
    const errors: FieldErrors = {};
    if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) {
        errors.email = "Enter a valid email address";
    }
    if(!values.password){
        errors.password = "Enter your password";
    }else if(values.password.length > 72){
        errors.password = "Password is too long";
    }

    return errors;
}

function issuesToFieldErrors(
    issues: ServerIssue[] = []
): FieldErrors {
    const errors: FieldErrors = {};

    for(const issue of issues){
        const field = issue.path[0] as Field | undefined;

        if(field && FIELD_ORDER.includes(field) && !errors[field]){
            errors[field] = issue.message;
        }
    }
    return errors;
}

function FieldError({ id, message }: { id: string; message?: string }){
    if(!message) return null;
    
    return (
        <p id={id} className="mt-1 text-sm text-red-700 dark:text-red-400">
            {message}
        </p>
    );
}

const inputClass = 
    `mt-1 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-purple-600 aria-[invalid=true]:border-red-600 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-50`;

const labelClass = "block text-sm font-medium text-stone-800 dark:text-stone-200";

export function LoginForm({onSuccess, singupHref = "/signup"}: LoginFormProps){
    const queryClient = useQueryClient();

    const [values, setValues] = useState<Record<Field, string>>({
        email: "",
        password: ""
    });
    const [clientErrors, setClientErrors] = useState<FieldErrors>({});
    const [showPassword, setShowPassword] = useState(false);

    const login = useMutation<{ user: LoginUser }, ApiError, LoginBody>({
        mutationFn: (body) => request<{ user: LoginUser }>("/auth/login", { method: "POST", body: JSON.stringify(body)}),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: meKey });
            toast.success("Welcome back");
        } 
    })

    const serverFieldErrors = useMemo(
        () => issuesToFieldErrors(login.error?.issues),
        [login.error]
    );

    const errors: FieldErrors = {
        ...serverFieldErrors,
        ...clientErrors,
    };
    const formError = login.error && Object.keys(serverFieldErrors).length === 0 ? friendlyMessage(login.error) : "";

    const set = (field: Field, value: string) => {
        setValues((prev) => ({ ...prev, [field]: value}));
        if (clientErrors[field]) {
            setClientErrors((prev) => ({
                ...prev,
                [field]: undefined,
            }));
        }

        if (login.isError) login.reset();
    }

    const focusById = (field: Field) => document.getElementById(`login-${field}`)?.focus();

    const focusFirst = (fieldErrors: FieldErrors) => {
        const first = FIELD_ORDER.find((field) => fieldErrors[field]);

        if (first) {
        document.getElementById(`login-${first}`)?.focus();
        }
    };

    function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (login.isPending) return;

        const found = validate(values);
        setClientErrors(found);

        if (Object.keys(found).length > 0) {
            focusFirst(found);
            return;
        }

        login.mutate(
        {
            email: values.email.trim(),
            password: values.password,
        },
        {
            onSuccess: ({ user }) => onSuccess(user),
            onError: (error) => {
                const fieldErrors = issuesToFieldErrors(error.issues);
                if (Object.keys(fieldErrors).length > 0) focusFirst(fieldErrors);
                else focusById("password"); 
            }
        }
        );
    }

    return (
        <form onSubmit={handleSubmit} noValidate className="w-full max-w-md space-y-5">
            <h1 className="text-2xl font-semibold text-stone-900 dark:text-stone-50">Access your account</h1>

            {formError && (
                <div
                    role="alert"
                    className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
                >
                    {formError}
                </div>
            )}

            <div>
                <label htmlFor="login-email" className={labelClass}>Email</label>
                <input
                    id="login-email"
                    type="email"
                    className={inputClass}
                    value={values.email}
                    onChange={(e) => set("email", e.target.value)}
                    autoComplete="email"
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? "login-email-error" : undefined}
                />
                <FieldError id="login-email-error" message={errors.email} />
            </div>
            <div>
                <label htmlFor="login-password" className={labelClass}>Password</label>
                <div className="relative">
                    <input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        className={`${inputClass} pr-16`}
                        value={values.password}
                        onChange={(e) => set("password", e.target.value)}
                        autoComplete="current-password"
                        aria-invalid={Boolean(errors.password)}
                        aria-describedby={errors.password ? "login-password-error" : undefined}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        aria-pressed={showPassword}
                        className="absolute inset-y-0 right-2 my-1 rounded px-2 text-xs font-medium text-stone-600 hover:text-stone-900 focus-visible:outline-2 focus-visible:outline-purple-600 dark:text-stone-400 dark:hover:text-stone-50"
                    >
                        {showPassword ? "Hide" : "Show"}
                    </button>
                </div>
                <FieldError
                    id="login-password-error"
                    message={errors.password}
                />
            </div>
            <button
                type="submit"
                disabled={login.isPending}
                className="w-full rounded-md bg-purple-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {login.isPending ? "Logging in…" : "Log in"}
            </button>

            <p className="text-center text-sm text-stone-600 dark:text-stone-400">
                Don&apos;t have an account?{" "}
                <Link href={singupHref} className="font-medium text-purple-700 underline-offset-2 hover:underline dark:text-purple-400">
                    Sign up
                </Link>
            </p>
        </form>
    )
}