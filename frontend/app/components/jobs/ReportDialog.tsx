"use client";

import { useState } from "react";
import { HttpError } from "@/providers/dataProvider";
import { friendlyMessage } from "@/lib/notify";
import { Alert, inputClass, labelClass, primaryButton, secondaryButton } from "@/app/components/ui";
import { Modal } from "./Modal";

export const REPORT_REASONS = [
    { value: "FAKE_OR_MISLEADING", label: "Fake or misleading job" },
    { value: "ASKS_FOR_MONEY", label: "Asks for money or sensitive details" },
    { value: "OFFENSIVE", label: "Discriminatory or offensive" },
    { value: "NO_LONGER_AVAILABLE", label: "Job is no longer available" },
    { value: "OTHER", label: "Something else" },
] as const;

export interface ReportPayload {
    reason: (typeof REPORT_REASONS)[number]["value"];
    details?: string;
}

function ReportForm({
    isPending,
    error,
    onCancel,
    onSubmit,
}: {
    isPending: boolean;
    error: HttpError | null;
    onCancel: () => void;
    onSubmit: (payload: ReportPayload) => void;
}) {
    const [reason, setReason] = useState<ReportPayload["reason"] | null>(null);
    const [details, setDetails] = useState("");

    return (
        <form
            noValidate
            onSubmit={(e) => {
                e.preventDefault();
                if (!reason || isPending) return;
                onSubmit({ reason, details: details.trim() || undefined });
            }}
            className="space-y-5"
        >
            {error && <Alert>{friendlyMessage(error)}</Alert>}

            <fieldset>
                <legend className={labelClass}>What&apos;s wrong with this job?</legend>
                <div className="mt-2 space-y-2">
                    {REPORT_REASONS.map((r) => (
                        <label key={r.value} className="flex cursor-pointer items-center gap-2 text-sm">
                            <input
                                type="radio"
                                name="report-reason"
                                checked={reason === r.value}
                                onChange={() => setReason(r.value)}
                                className="h-4 w-4 accent-purple-700"
                            />
                            {r.label}
                        </label>
                    ))}
                </div>
            </fieldset>

            <div>
                <label htmlFor="report-details" className={labelClass}>More details (optional)</label>
                <textarea
                    id="report-details"
                    rows={3}
                    maxLength={500}
                    className={`${inputClass} resize-y`}
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                />
            </div>

            <div className="flex items-center justify-end gap-3">
                <button type="button" className={secondaryButton} onClick={onCancel} disabled={isPending}>
                    Cancel
                </button>
                <button type="submit" className={primaryButton} disabled={!reason || isPending}>
                    {isPending ? "Sending…" : "Send report"}
                </button>
            </div>
        </form>
    );
}

export function ReportDialog(props: {
    open: boolean;
    onClose: () => void;
    isPending: boolean;
    error: HttpError | null;
    onSubmit: (payload: ReportPayload) => void;
}) {
    return (
        <Modal open={props.open} onClose={props.onClose} title="Report this job">
            <ReportForm
                isPending={props.isPending}
                error={props.error}
                onCancel={props.onClose}
                onSubmit={props.onSubmit}
            />
        </Modal>
    );
}