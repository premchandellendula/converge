"use client";

import { useState } from "react";
import { Modal } from "@/app/components/jobs/Modal";
import { primaryButton, secondaryButton } from "@/app/components/ui";
import { ApplicationStatus } from "@/lib/types";
import { actionFor, NEXT_STATUSES, useUpdateApplicationStatus } from "@/lib/applications";


const base = "rounded-md px-3 py-1.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60";
const tones = {
    default: "border border-stone-300 text-stone-800 hover:bg-stone-100 focus-visible:outline-purple-600 dark:border-stone-700 dark:text-stone-100 dark:hover:bg-stone-800",
    positive: "bg-green-700 text-white hover:bg-green-800 focus-visible:outline-green-700",
    danger: "border border-red-300 text-red-700 hover:bg-red-50 focus-visible:outline-red-700 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40",
};

/**
 * The status buttons for one application. Used in the list rows and on the detail page.
 * Only the moves allowed from the current status are shown; Reject and Hire ask first.
 */
export function ApplicationActions({
    id,
    status,
    name,
}: {
    id: number;
    status: ApplicationStatus;
    name: string;
}) {
    const update = useUpdateApplicationStatus();
    const [confirmTo, setConfirmTo] = useState<ApplicationStatus | null>(null);

    const options = NEXT_STATUSES[status];
    if (options.length === 0) return null;

    function run(to: ApplicationStatus) {
        update.mutate({ id, status: to }, { onSettled: () => setConfirmTo(null) });
    }

    const confirmAction = confirmTo ? actionFor(status, confirmTo) : null;

    return (
        <>
            {/* relative z-10 keeps the buttons clickable above a card's stretched link */}
            <div className="relative z-10 flex flex-wrap items-center gap-2">
                {options.map((to) => {
                    const action = actionFor(status, to);
                    return (
                        <button
                            key={to}
                            type="button"
                            disabled={update.isPending}
                            onClick={() => (action.confirm ? setConfirmTo(to) : run(to))}
                            className={`${base} ${tones[action.tone]}`}
                        >
                            {action.label}
                            <span className="sr-only"> {name}</span>
                        </button>
                    );
                })}
            </div>

            <Modal
                open={confirmTo !== null}
                onClose={() => !update.isPending && setConfirmTo(null)}
                title={confirmTo === "HIRED" ? `Mark ${name} as hired?` : `Reject ${name}?`}
            >
                <div className="space-y-5">
                    <p className="text-sm text-stone-700 dark:text-stone-300">
                        {confirmTo === "HIRED"
                            ? "The candidate will see their application as Hired. You can't change this afterwards."
                            : "The candidate will see their application as Not selected. You can reopen it later if you change your mind."}
                    </p>
                    <div className="flex items-center justify-end gap-3">
                        <button type="button" className={secondaryButton} onClick={() => setConfirmTo(null)} disabled={update.isPending}>
                            Cancel
                        </button>
                        <button
                            type="button"
                            className={confirmTo === "HIRED" ? primaryButton : `${base} bg-red-700 px-4 py-2 font-semibold text-white hover:bg-red-800 focus-visible:outline-red-700`}
                            disabled={update.isPending}
                            onClick={() => confirmTo && run(confirmTo)}
                        >
                            {update.isPending ? "Saving…" : confirmAction?.label}
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
}