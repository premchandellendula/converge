import { useQuery } from "@tanstack/react-query";
import { dataProvider } from "@/providers/dataProvider";
import { EMPTY_RECRUITER_DRAFT, normalizeUrl, RecruiterDraft } from "@/app/components/recruiter/onboarding/draft";

/* ---------- What GET /recruiters/me returns (see recruiter-profile-backend.md) ---------- */

export interface RecruiterProfile {
    id: number;
    user: { firstName: string; lastName: string; email: string; phone: string | null; avatarUrl: string | null };
    designation: string;
    department: string | null;
    workEmail: string | null;
    linkedinUrl: string | null;
    bio: string | null;
    companyRole: "ADMIN" | "MEMBER";
    isVerified: boolean;
    joinedAt: string;
    company: {
        id: number;
        name: string;
        slug: string;
        logoUrl: string | null;
        website: string | null;
        description: string | null;
        headquarters: string | null;
        isVerified: boolean;
    } | null;
    _count?: { jobsPosted: number };
}

export const recruiterProfileKey = ["recruiter", "me"] as const;

// If the API leaves out the user, treat it as empty instead of crashing.
function withDefaults(p: RecruiterProfile): RecruiterProfile {
    return {
        ...p,
        user: p.user ?? { firstName: "", lastName: "", email: "", phone: null, avatarUrl: null },
        company: p.company ?? null,
    };
}

export function useRecruiterProfile() {
    return useQuery({
        queryKey: recruiterProfileKey,
        queryFn: async () => (await dataProvider.getOne<RecruiterProfile>("recruiters", "me")).data,
        select: withDefaults,
    });
}

/* ---------- Edit form ---------- */

// The edit form reuses the onboarding "About you" fields. The company fields stay empty here:
// company details are edited in the company module (ADMIN only), not through this endpoint.
export function profileToDraft(p: RecruiterProfile): RecruiterDraft {
    return {
        ...EMPTY_RECRUITER_DRAFT,
        designation: p.designation,
        department: p.department ?? "",
        workEmail: p.workEmail ?? "",
        linkedinUrl: p.linkedinUrl ?? "",
        bio: p.bio ?? "",
    };
}

const orNull = (s: string) => s.trim() || null;

/**
 * An update must be able to CLEAR fields, so empty optional values are sent as null.
 * The backend schema has to accept null for these (see recruiter-profile-backend.md).
 */
export function buildUpdateBody(d: RecruiterDraft) {
    return {
        designation: d.designation.trim(),
        department: orNull(d.department),
        workEmail: orNull(d.workEmail),
        linkedinUrl: orNull(normalizeUrl(d.linkedinUrl)),
        bio: orNull(d.bio),
    };
}