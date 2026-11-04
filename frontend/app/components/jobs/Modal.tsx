"use client";

import { ReactNode, useEffect, useRef } from "react";

/** A small accessible modal built on the native <dialog> element (focus trap and Esc come for free). */
export function Modal({
    open,
    onClose,
    title,
    children,
}: {
    open: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
}) {
    const ref = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = ref.current;
        if (!dialog) return;
        if (open && !dialog.open) dialog.showModal();
        if (!open && dialog.open) dialog.close();
    }, [open]);

    return (
        <dialog
            ref={ref}
            onClose={onClose}
            onClick={(e) => {
                if (e.target === ref.current) onClose(); // click on the backdrop
            }}
            aria-labelledby="modal-title"
            className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-xl border border-stone-200 bg-white p-0 text-stone-900 shadow-xl backdrop:bg-black/50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
        >
            {/* Children only exist while open, so each opening starts with a fresh form */}
            {open && (
                <div className="p-5 sm:p-6">
                    <h2 id="modal-title" className="mb-4 text-lg font-semibold">{title}</h2>
                    {children}
                </div>
            )}
        </dialog>
    );
}