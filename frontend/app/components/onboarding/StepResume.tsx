import { friendlyMessage, notifySuccess } from "@/lib/notify";
import { dataProvider, HttpError } from "@/providers/dataProvider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChangeEvent, useState } from "react";
import { Alert, FieldError, labelClass, primaryButton, secondaryButton } from "../ui";

const MAX_BYTES = 5 * 1024 * 1024;

export function StepResume({ onDone, onSkip }: { onDone: () => void; onSkip: () => void }) {
    const queryClient = useQueryClient();
    const [file, setFile] = useState<File | null>(null);
    const [fileError, setFileError] = useState("");

    const upload = useMutation<{id: number} , HttpError, File>({
        mutationFn: dataProvider.uploadResume,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["resumes"] });
            notifySuccess("Resume uploaded");
            onDone();
        }
    })

    function handleChange(e: ChangeEvent<HTMLInputElement>){
        const chosen = e.target.files?.[0] ?? null;
        upload.reset();
        setFile(null);
        setFileError("");
        if(!chosen) return;

        if(chosen.type !== "application/pdf") setFileError("Choose a PDF file");
        else if(chosen.size > MAX_BYTES) setFileError("The file is larger than 5 MB");
        else setFile(chosen);
    }

    return (
        <div className="space-y-5">
            {upload.error && <Alert>{friendlyMessage(upload.error)}</Alert>}

            <div>
                <label htmlFor="onb-resume" className={labelClass}>Resume (PDF, up to 5 MB)</label>
                <input 
                    type="file" 
                    id="onb-resume"
                    accept="application/pdf"
                    onChange={handleChange}
                    aria-invalid={Boolean(fileError)}
                    aria-describedby={fileError ? "onb-resume-error" : undefined}
                    className="mt-1 block w-full text-sm text-stone-700 file:mr-3 file:rounded-md file:border-0 file:bg-stone-200 file:px-3 file:py-2 file:text-sm file:font-medium hover:file:bg-stone-300 dark:text-stone-300 dark:file:bg-stone-700 dark:hover:file:bg-stone-600"
                />
                <FieldError id="onb-resume-error" message={fileError} />
                {file && (
                    <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
                        {file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)
                    </p>
                )}
            </div>
            <p className="text-sm text-stone-600 dark:text-stone-400">You need a resume to apply to jobs, but you can add it later.</p>

            <div className="flex items-center justify-between gap-3">
                <button type="button" className={secondaryButton} onClick={onSkip} disabled={upload.isPending}>
                    Skip for now
                </button>
                <button type="button" className={primaryButton} disabled={!file || upload.isPending} onClick={() => file && upload.mutate(file)}>
                    {upload.isPending ? "Uploading…" : "Upload and finish"}
                </button>
            </div>
        </div>
    )
}