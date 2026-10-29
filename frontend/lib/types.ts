export type JobType = "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP";
export type WorkMode = "ONSITE" | "HYBRID" | "REMOTE";
export type JobStatus = "OPEN" | "CLOSED";
export type ApplicationStatus = "APPLIED" | "SHORTLISTED" | "INTERVIEW" | "REJECTED" | "HIRED" | "WITHDRAWN";

export interface JobListItem {
    id: number;
    title: string;
    location: string;
    jobType: JobType;
    workMode: WorkMode;
    experienceMin: number | null;
    experienceMax: number | null;
    salaryMin: number | null;
    salaryMax: number | null;
    currency: string;
    createdAt: string;
    company: { id: number; name: string; slug: string; logoUrl: string | null };
    skills: { name: string }[];
}

export interface JobDetail extends JobListItem {
    description: string;
    openings: number;
    status: JobStatus;
    expiredAt: string | null;
    updatedAt: string;
}

export interface FacetOption {
    value: string;
    count: number;
}

export interface JobFacets {
    jobType: FacetOption[];
    workMode: FacetOption[];
    location: FacetOption[];
    experience: FacetOption[];
    salary: FacetOption[];
    postedWithin: FacetOption[];
}

export interface JobFilterSet {
    q?: string;
    jobType?: JobType[];
    workMode?: WorkMode[];
    location?: string[];
    expMin?: number;
    expMax?: number;
    salaryMin?: number;
    salaryMax?: number;
    postedWithin?: number;
}

export interface JobFilters extends JobFilterSet {
    sort?: "recent" | "popular";
    page?: number;
    limit?: number;
}

export interface CreateJobBody {
    title: string;
    description: string;
    location: string;
    jobType: JobType;
    workMode: WorkMode;
    experienceMin?: number;
    experienceMax?: number;
    salaryMin?: number;
    salaryMax?: number;
    currency?: string;
    openings?: number;
    expiresAt?: string; // ISO date-time
    skills?: string[]; // skill names
}

export type UpdateJobBody = Partial<CreateJobBody> & { status?: JobStatus };

export interface SavedJobItem {
    savedAt: string;
    job: JobListItem & { status: JobStatus; expiresAt: string | null };
}

export interface MyApplicationItem {
    id: number;
    status: ApplicationStatus;
    coverLetter: string | null;
    createdAt: string;
    job: {
        id: number;
        title: string;
        location: string;
        status: JobStatus;
        company: { name: string; logoUrl: string | null };
    };
}
