"use client";
import { meKey, Role } from "@/lib/auth";
import { friendlyMessage } from "@/lib/notify";
import { ApiError, request, ServerIssue } from "@/lib/request";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";

export interface SignupUser {
    id: string;
    role: Role;
}

interface SignupBody {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    password: string;
    role: Role;
}

type Field = "firstName" | "lastName" | "email" | "phone" | "password" | "role";
type FieldErrors = Partial<Record<Field, string>>;

export interface SignupFormProps {
    onSuccess: (user: SignupUser) => void;
    loginHref?: string;
    defaultRole?: Role;
}

const ROLE_OPTIONS: { value: Role, title: string, hint: string }[] = [
    { value: "Candidate", title: "Find a job", hint: "Apply to jobs and track your applications" },
    { value: "Recruiter", title: "Hire people", hint: "Post jobs and review applications" }
]

const FIELD_ORDER: Field[] = ["firstName", "lastName", "email", "phone", "password", "role"];

function validate(v: Record<Field, string>): FieldErrors {
    const e: FieldErrors = {};
    if(!v.firstName.trim()) e.firstName = "Enter your first name"
    else if(v.firstName.trim().length > 50) e.firstName = "Use 50 characters or fewer"
    if (!v.lastName.trim()) e.lastName = "Enter your last name";
    else if (v.lastName.trim().length > 50) e.lastName = "Use 50 characters or fewer";
    if (!/^\S+@\S+\.\S+$/.test(v.email.trim())) e.email = "Enter a valid email address";
    if (v.phone.trim() && !/^\+[1-9]\d{6,14}$/.test(v.phone.trim())) {
        e.phone = "Use international format, for example +919876543210";
    }
    if (v.password.length < 8) e.password = "Use at least 8 characters";
    else if (v.password.length > 72) e.password = "Use 72 characters or fewer";
    if (v.role !== "Candidate" && v.role !== "Recruiter") e.role = "Choose what you want to do";
    return e;
}

function issuesToFieldErrors(issues: ServerIssue[] = []): FieldErrors {
    const out: FieldErrors = {};
    for (const issue of issues) {
        const key = issue.path[0] as Field | undefined;
        if (key && FIELD_ORDER.includes(key) && !out[key]) out[key] = issue.message;
    }
    return out;
}

const inputClass = 
    `mt-1 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-purple-600 aria-[invalid=true]:border-red-600 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-50`;

const labelClass = "block text-sm font-medium text-stone-800 dark:text-stone-200";

function FieldError({ id, message }: { id: string; message?: string }){
    if(!message) return null;
    
    return (
        <p id={id} className="mt-1 text-sm text-red-700 dark:text-red-400">
            {message}
        </p>
    );
}

export function SignupForm({ onSuccess, loginHref = "/login", defaultRole = "Candidate"}: SignupFormProps){
    const queryClient = useQueryClient();

    const [values, setValues] = useState<Record<Field, string>>({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        role: defaultRole,
    })
    const [clientErrors, setClientErrors] = useState<FieldErrors>({});
    const [showPassword, setShowPassword] = useState(false);

    const signup = useMutation<{ user: SignupUser }, ApiError, SignupBody>({
        mutationFn: (body) => request<{ user: SignupUser }>("/users/signup", { method: "POST", body: JSON.stringify(body)}),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: meKey })
            toast.success("Account created");
        } 
    })

    const serverFieldErrors = useMemo(() => issuesToFieldErrors(signup.error?.issues), [signup.error]);
    const errors: FieldErrors = { ...serverFieldErrors, ...clientErrors };
    const formError = signup.error && Object.keys(serverFieldErrors).length === 0 ? friendlyMessage(signup.error) : "";

    const set = (field: Field, value: string) => {
        setValues((prev) => ({ ...prev, [field]: value }));
        if (clientErrors[field]) setClientErrors((prev) => ({ ...prev, [field]: undefined }));
        if (signup.isError) signup.reset(); // editing means the last server answer no longer applies
    };

    const focusById = (field: Field) => document.getElementById(`signup-${field}`)?.focus();

    const focusFirst = (errs: FieldErrors) => {
        const first = FIELD_ORDER.find((f) => errs[f]);
        if (first) document.getElementById(`signup-${first}`)?.focus();
    };

    function handleSubmit(e: FormEvent<HTMLFormElement>){
        e.preventDefault();
        if(signup.isPending) return;

        const found = validate(values);
        setClientErrors(found);
        if(Object.keys(found).length > 0){
            focusFirst(found);
            return;
        }

        const body: SignupBody = {
            firstName: values.firstName.trim(),
            lastName: values.lastName.trim(),
            email: values.email.trim(),
            password: values.password,
            role: values.role as Role
        }
        if (values.phone.trim()) body.phone = values.phone.trim();
        signup.mutate(body, {
            onSuccess: ({ user }) => onSuccess(user),
            onError: (err) => {
                const fieldErrors = issuesToFieldErrors(err.issues);
                if (Object.keys(fieldErrors).length > 0) focusFirst(fieldErrors);
                else if (err.status === 409) focusById("email");
            },
        });
    }

    return (
        <form onSubmit={handleSubmit} noValidate className="w-full max-w-md space-y-5">
            <h1 className="text-2xl font-semibold text-stone-900 dark:text-stone-50">Create your account</h1>

            {formError && (
                <div
                    role="alert"
                    className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
                >
                    {formError}
                </div>
            )}
            <fieldset>
                <legend className={labelClass}>What do you want to do?</legend>
                <div className="mt-2 grid grid-cols-2 gap-3">
                    {ROLE_OPTIONS.map((opt) => {
                        const selected = values.role === opt.value;
                        return (
                            <label
                                key={opt.value}
                                className={`cursor-pointer rounded-lg border p-3 focus-within:outline-2 focus-within:outline-offset-1 focus-within:outline-purple-600 ${
                                selected
                                    ? "border-purple-600 bg-purple-50 dark:border-purple-500 dark:bg-purple-950"
                                    : "border-stone-300 hover:border-stone-400 dark:border-stone-700"
                                }`}
                            >
                                <input
                                    id={opt.value === "Candidate" ? "signup-role" : undefined}
                                    type="radio"
                                    name="role"
                                    value={opt.value}
                                    checked={selected}
                                    onChange={() => set("role", opt.value)}
                                    className="sr-only"
                                />
                                <span className="block text-sm font-semibold text-stone-900 dark:text-stone-50">{opt.title}</span>
                                <span className="mt-0.5 block text-xs text-stone-600 dark:text-stone-400">{opt.hint}</span>
                            </label>
                        )
                    })}
                </div>
                <FieldError id="signup-role-error" message={errors.role} />
            </fieldset>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label htmlFor="signup-firstName" className={labelClass}>First name</label>
                    <input
                        id="signup-firstName"
                        className={inputClass}
                        value={values.firstName}
                        onChange={(e) => set("firstName", e.target.value)}
                        autoComplete="given-name"
                        aria-invalid={Boolean(errors.firstName)}
                        aria-describedby={errors.firstName ? "signup-firstName-error" : undefined}
                    />
                    <FieldError id="signup-firstName-error" message={errors.firstName} />
                </div>
                <div>
                    <label htmlFor="signup-lastName" className={labelClass}>Last name</label>
                    <input
                        id="signup-lastName"
                        className={inputClass}
                        value={values.lastName}
                        onChange={(e) => set("lastName", e.target.value)}
                        autoComplete="family-name"
                        aria-invalid={Boolean(errors.lastName)}
                        aria-describedby={errors.lastName ? "signup-lastName-error" : undefined}
                    />
                    <FieldError id="signup-lastName-error" message={errors.lastName} />
                </div>
            </div>
            <div>
                <label htmlFor="signup-email" className={labelClass}>Email</label>
                <input
                    id="signup-email"
                    type="email"
                    className={inputClass}
                    value={values.email}
                    onChange={(e) => set("email", e.target.value)}
                    autoComplete="email"
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? "signup-email-error" : undefined}
                />
                <FieldError id="signup-email-error" message={errors.email} />
            </div>

            <div>
                <label htmlFor="signup-phone" className={labelClass}>Phone number (optional)</label>
                <input 
                    type="tel"
                    id="signup-phone"
                    className={inputClass}
                    placeholder="+919876543210"
                    value={values.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    autoComplete="tel"
                    aria-invalid={Boolean(errors.phone)}
                    aria-describedby={errors.phone ? "signup-phone-error" : "signup-phone-hint"}
                />
                {errors.phone ? (
                    <FieldError id="signup-phone-error" message={errors.phone} />
                    ) : (
                    <p id="signup-phone-hint" className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                        Include the country code.
                    </p>
                )}
            </div>
            <div>
                <label htmlFor="signup-password" className={labelClass}>Password</label>
                <div className="relative">
                    <input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        className={`${inputClass} pr-16`}
                        value={values.password}
                        onChange={(e) => set("password", e.target.value)}
                        autoComplete="new-password"
                        aria-invalid={Boolean(errors.password)}
                        aria-describedby={errors.password ? "signup-password-error" : "signup-password-hint"}
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
                {errors.password ? (
                    <FieldError id="signup-password-error" message={errors.password} />
                    ) : (
                    <p id="signup-password-hint" className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                        At least 8 characters. A short sentence works well.
                    </p>
                )}
            </div>
            <button
                type="submit"
                disabled={signup.isPending}
                className="w-full rounded-md bg-purple-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {signup.isPending ? "Creating your account…" : "Create account"}
            </button>

            <p className="text-center text-sm text-stone-600 dark:text-stone-400">
                Already have an account?{" "}
                <Link href={loginHref} className="font-medium text-purple-700 underline-offset-2 hover:underline dark:text-purple-400">
                    Log in
                </Link>
            </p>
        </form>
    )
}