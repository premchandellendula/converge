import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { dataProvider, HttpError, queryKeys } from "@/providers/dataProvider";
import { friendlyMessage } from "@/lib/notify";
import { Currency, EducationLevel, ScopeType } from "@/app/components/onboarding/draft";
import type { ApplicantProfile } from "@/lib/profile";

/* ---------- Status rules (the backend must enforce the same table) ---------- */

export type ApplicationStatus = "APPLIED" | "SHORTLISTED" | "INTERVIEW" | "REJECTED" | "HIRED" | "WITHDRAWN";

// Recruiter-facing names. (Candidates see "Applied" / "Not selected" instead.)
export const STATUS_LABEL: Record<ApplicationStatus, string> = {
    APPLIED: "New",
    SHORTLISTED: "Shortlisted",
    INTERVIEW: "Interview",
    HIRED: "Hired",
    REJECTED: "Rejected",
    WITHDRAWN: "Withdrawn",
};

export const NEXT_STATUSES: Record<ApplicationStatus, ApplicationStatus[]> = {
    APPLIED: ["SHORTLISTED", "REJECTED"],
    SHORTLISTED: ["INTERVIEW", "REJECTED"],
    INTERVIEW: ["HIRED", "REJECTED"],
    REJECTED: ["APPLIED"], // reopen
    HIRED: [],
    WITHDRAWN: [], // only the candidate can withdraw, and it is final
};

export interface StatusAction {
    label: string;
    tone: "default" | "positive" | "danger";
    confirm: boolean; // ask before doing it
}

export function actionFor(from: ApplicationStatus, to: ApplicationStatus): StatusAction {
    if (to === "REJECTED") return { label: "Reject", tone: "danger", confirm: true };
    if (to === "HIRED") return { label: "Hire", tone: "positive", confirm: true };
    if (to === "SHORTLISTED") return { label: "Shortlist", tone: "default", confirm: false };
    if (to === "INTERVIEW") return { label: "Interview", tone: "default", confirm: false };
    return { label: from === "REJECTED" ? "Reopen" : "Move to new", tone: "default", confirm: false };
}

/* ---------- What the backend returns (see recruiter-applications-backend.md) ---------- */

export interface ApplicationRow {
    id: number;
    status: ApplicationStatus;
    createdAt: string;
    hasResume: boolean;
    matchedSkills: string[];     // the job's skills this applicant has
    requiredSkillCount: number;  // how many skills the job lists
    applicant: {
        user: { firstName: string; lastName: string };
        location: string | null;
        totalExpInYears: number;
        remainingExpMonths: number;
        expectedSalary: number | null;
        currency: Currency;
        noticePeriodDays: number | null;
        currentRole: { title: string; companyName: string } | null; // from the latest work experience
        education: { level: EducationLevel; institution: string } | null; // the highest one
    };
}

export interface ApplicationDetail {
    id: number;
    status: ApplicationStatus;
    createdAt: string;
    updatedAt: string;
    coverLetter: string | null;
    hasResume: boolean;
    matchedSkills: string[];
    requiredSkillCount: number;
    job: {
        id: number;
        title: string;
        salaryMin: number | null;
        salaryMax: number | null;
        currency: string;
    };
    applicant: Pick<
        ApplicantProfile,
        | "user" | "summary" | "location" | "linkedinUrl" | "githubUrl" | "totalExpInYears" | "remainingExpMonths"
        | "expectedSalary" | "currency" | "noticePeriodDays" | "willingToRelocate" | "preferredLocations"
        | "skills" | "educations" | "workExperiences"
    > & { user: { email: string; phone: string | null; avatarUrl: string | null } };
}

export type { ScopeType };

/* ---------- Query keys (all under ["recruiter"], so one invalidation refreshes everything) ---------- */

export const applicationKeys = {
    list: (jobId: number, status: string, q: string, page: number) =>
        ["recruiter", "applications", jobId, status, q, page] as const,
    counts: (jobId: number) => ["recruiter", "application-counts", jobId] as const,
    detail: (id: number) => ["recruiter", "application", id] as const,
};

/* ---------- Changing a status ---------- */

export function useUpdateApplicationStatus() {
    const queryClient = useQueryClient();

    return useMutation<unknown, HttpError, { id: number; status: ApplicationStatus }>({
        // PATCH /recruiters/applications/:id/status  (dataProvider.update builds `/${resource}/${id}`)
        mutationFn: ({ id, status }) =>
            dataProvider.update("recruiters/applications", { id: `${id}/status`, data: { status } }),
        onSuccess: async (_data, { status }) => {
            await queryClient.invalidateQueries({ queryKey: queryKeys.recruiter.all });
            toast.success(status === "HIRED" ? "Marked as hired" : `Moved to ${STATUS_LABEL[status]}`);
        },
        onError: (error) => toast.error(friendlyMessage(error)),
    });
}

/* ---------- Small formatting helpers ---------- */

export function experienceLabel(years: number, months: number): string {
    if (years === 0 && months === 0) return "Fresher";
    const parts = [years > 0 ? `${years} yr${years === 1 ? "" : "s"}` : null, months > 0 ? `${months} mo` : null];
    return parts.filter(Boolean).join(" ");
}

export const fullName = (u: { firstName: string; lastName: string }) => `${u.firstName} ${u.lastName}`.trim();