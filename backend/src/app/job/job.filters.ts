import type { Prisma } from "../../generated/prisma/client.js";
import type { JobFilters } from "./job.schema.js";

const LPA = 100_000;

export const EXPERIENCE_BUCKETS: { key: string; min: number; max: number | null}[] = [
    {key: "0-1", min: 0, max: 1},
    {key: "1-3", min: 1, max: 3},
    {key: "3-5", min: 3, max: 5},
    {key: "5-8", min: 5, max: 8},
    {key: "8+", min: 8, max: null},
]

export const SALARY_BUCKETS: { key: string; min: number; max: number | null }[] = [
    { key: "0-3", min: 0, max: 3 },
    { key: "3-6", min: 3, max: 6 },
    { key: "6-10", min: 6, max: 10 },
    { key: "10-15", min: 10, max: 15 },
    { key: "15-25", min: 15, max: 25 },
    { key: "25+", min: 25, max: null },
];
export const toRupees = (lpa: number) => lpa * LPA;
export const POSTED_WITHIN = [1, 3, 7, 30]; // days
export const daysAgo = (days: number) => new Date(Date.now() - days * 86_400_000);

export type FilterKey = "jobType" | "workMode" | "location" | "experience" | "salary" | "postedWithin";

export function overlapExperience(min?: number, max?: number): Prisma.JobWhereInput[] {
    const c: Prisma.JobWhereInput[] = [];
    if(max !== undefined) c.push({ OR: [{ experienceMin: null }, { experienceMin: { lte: max } }] });
    if(min !== undefined) c.push({ OR: [{ experienceMax: null }, { experienceMax: { gte: min } }] })
    return c;
}

export function overlapSalary(min?: number, max?: number): Prisma.JobWhereInput[] {
    const c: Prisma.JobWhereInput[] = [{ currency: "INR" }, { salaryMax: { not: null } }];
    if(min !== undefined) c.push({ salaryMax: { gte: min }});
    if(max !== undefined) c.push({ OR: [{ salaryMin: null }, { salaryMin: { lte: max } }] });
    return c;
}

export function buildWhere(f: JobFilters, omit?: FilterKey): Prisma.JobWhereInput {
    const and: Prisma.JobWhereInput[] = [
        { status: "OPEN" },
        { OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] }
    ]

    if(f.q){
        and.push({
            OR: [
                { title: { contains: f.q, mode: "insensitive" }},
                { skills: { some: { name: { contains: f.q, mode: "insensitive" } } } },
            ]
        })
    }

    if(omit !== "jobType" && f.jobType?.length) and.push({ jobType: { in: f.jobType } });
    if(omit !== "workMode" && f.workMode?.length) and.push({ workMode: { in: f.workMode } });
    if(omit !== "location" && f.location?.length) and.push({ location: { in: f.location } });
    if(omit !== "experience") and.push(...overlapExperience(f.expMin, f.expMax));
    if(omit !== "salary" && (f.salaryMin !== undefined || f.salaryMax !== undefined)){
        and.push(...overlapSalary(f.salaryMin, f.salaryMax))
    }
    if (omit !== "postedWithin" && f.postedWithin) {
        and.push({ createdAt: { gte: daysAgo(f.postedWithin) } });
    }

    return { AND: and };
}