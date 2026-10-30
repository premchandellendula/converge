import { authProvider } from "@/providers/authProvider";
import { Bookmark, Briefcase, Building2, LifeBuoy, LogOut, LucideIcon, Settings, SquarePen, SquarePlus, SunMoon, User } from "lucide-react";
import { useEffect, useRef } from "react"
import ThemeButton from "./ThemeButton";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { useMe } from "@/lib/auth";
import { useRouter } from "next/navigation";

type FlyoutProps = {
    setIsFlyoutOpen: (value: boolean) => void;
    user?: { name?: string; email?: string };
}

type NavItem = { href: string; icon: LucideIcon, label: string };
const ROLE_LINKS: Record<string, NavItem[]> = {
    Candidate: [
        { href: "/profile", icon: User, label: "View profile"},
        { href: "/profile/edit", icon: SquarePen, label: "Edit profile"},
        { href: "/saved-jobs", icon: Bookmark, label: "Saved jobs"},
        { href: "/applied-jobs", icon: Briefcase, label: "Applied jobs"},
    ],
    Recruiter: [
        { href: "/recruiter/profile", icon: User, label: "View profile"},
        { href: "/recruiter/company", icon: Building2, label: "Company"},
        { href: "/recruiter/jobs", icon: Briefcase, label: "My jobs"},
        { href: "/recruiter/jobs/new", icon: SquarePlus, label: "Post a job"},
    ]
}

const Divider = () => <div className="h-px bg-stone-200 dark:bg-stone-700" />;

const itemClass =
    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-left transition-colors cursor-pointer hover:bg-stone-100 dark:hover:bg-stone-800";

const MenuLink = ({
    href,
    icon: Icon,
    label,
    onClick,
}: {
    href: string,
    icon: LucideIcon,
    label: string,
    onClick: () => void
}) => (
    <Link href={href} onClick={onClick} role="menuitem" className={itemClass}>
        <Icon size={16} className="shrink-0 text-stone-500 dark:text-stone-400" />
        {label}
    </Link>
)
const Flyout = ({ setIsFlyoutOpen, user }: FlyoutProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const close = () => setIsFlyoutOpen(false);
    const { data: me } = useMe();

    const email = user?.email || "onezune@gmail.com"

    useEffect(() => {
        const onMouseDown = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if(target.closest("[data-flyout-trigger]")) return;
            if(ref.current && !ref.current.contains(target)) close();
        }
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") close();
            setIsFlyoutOpen(false);
            document.querySelector<HTMLElement>("[data-flyout-trigger]")?.focus();
        };
        document.addEventListener("mousedown", onMouseDown);
        document.addEventListener("keydown", onKeyDown);

        return () => {
            document.removeEventListener("mousedown", onMouseDown);
            document.removeEventListener("keydown", onKeyDown);
        }
    }, [setIsFlyoutOpen])

    if (!me) return null;

    const name = `${me.firstName} ${me.lastName}`;

    return (
        <div 
            ref={ref} 
            role="menu"
            className="absolute right-2 top-14 z-50 w-72 overflow-hidden rounded-xl border border-stone-200 bg-white text-stone-800 shadow-xl dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100">
            <div className="flex items-center gap-3 p-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-purple-600 text-lg font-semibold text-white">
                    {me.firstName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{name}</p>
                    <p className="truncate text-xs text-stone-500 dark:text-stone-400">{me.email}</p>
                </div>
            </div>
            <Divider />

            <div className="flex flex-col gap-0.5 p-2">
                {ROLE_LINKS[me.role].map((item) => (
                    <MenuLink key={item.href} {...item} onClick={close} />
                ))}
                {/* <MenuLink href="/profile" icon={User} label="View profile" onClick={close} />
                <MenuLink href="/profile/edit" icon={SquarePen} label="Edit profile" onClick={close} />
                <MenuLink href="/saved-jobs" icon={Bookmark} label="Saved jobs" onClick={close} />
                <MenuLink href="/applied-jobs" icon={Briefcase} label="Applied jobs" onClick={close} /> */}
            </div>
            <Divider />
            <div className="flex items-center justify-between px-5 py-3">
                <span className="flex items-center gap-3 text-sm">
                    <SunMoon size={16} className="text-stone-500 dark:text-stone-400" />
                    Theme
                </span>
                <ThemeButton />
            </div>
            <Divider />
            <div className="flex flex-col gap-0.5 p-2">
                <MenuLink href="/help" icon={LifeBuoy} label="Help" onClick={close} />
                <MenuLink href="/settings" icon={Settings} label="Settings" onClick={close} />
                <button
                    type="button"
                    role="menuitem"
                    onClick={() => authProvider.logout()}
                    className={`${itemClass} text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40`}
                >
                    <LogOut size={16} className="shrink-0" />
                    Logout
                </button>
            </div>
        </div>
    )
}

export default Flyout