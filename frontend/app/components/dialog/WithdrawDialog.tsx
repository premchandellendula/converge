"use client";

import { HttpError } from "@/providers/dataProvider";
import { Alert, secondaryButton } from "../ui";
import { friendlyMessage } from "@/lib/notify";
import { Modal } from "../jobs/Modal";

const dangerButton = "rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 disabled:cursor-not-allowed disabled:opacity-60";

export function WithdrawDialog({
    open,
    onClose,
    jobTitle,
    companyName,
    isPending,
    error,
    onConfirm,
}: {
    open: boolean;
    onClose: () => void;
    jobTitle: string;
    companyName: string;
    isPending: boolean;
    error: HttpError | null;
    onConfirm: () => void;
}) {
    return (
        <Modal open={open} onClose={() => !isPending && onClose()} title="Withdraw your application?">
            <div className="space-y-5">
                {error && <Alert>{friendlyMessage(error)}</Alert>}

                <p className="text-sm text-stone-700 dark:text-stone-300">
                    You&apos;re about to withdraw your application for <strong>{jobTitle}</strong> at{" "}
                    <strong>{companyName}</strong>. The recruiter will see it as withdrawn. If the job is still open,
                    you can apply again later.
                </p>

                <div className="flex items-center justify-end gap-3">
                    <button type="button" className={secondaryButton} onClick={onClose} disabled={isPending}>
                        Keep application
                    </button>
                    <button type="button" className={dangerButton} onClick={onConfirm} disabled={isPending}>
                        {isPending ? "Withdrawing…" : "Withdraw"}
                    </button>
                </div>
            </div>
        </Modal>
    )
}