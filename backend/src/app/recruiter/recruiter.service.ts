import type { CompanyRole } from "../../generated/prisma/enums.js";
import { makeSlug } from "../../shared/lib.js";
import { Result, ResultCode, ResultWithCount } from "../../shared/result/result.js";
import { jobPostingSelect, type JobDao, type JobListItem, type JobPostingItem } from "../job/job.dao.js";
import type { RecruiterDao, RecruiterResponse } from "./recruiter.dao.js";
import type { CreateRecruiterDto, UpdateRecruiterDto } from "./recruiter.schema.js";

export interface RecruiterContext {
    id: number;
    companyId: number;
    companyRole: CompanyRole;
}

export class RecruiterService {
    constructor(
        private readonly recruiterDao: RecruiterDao,
        private readonly jobsDao: JobDao
    ) {}

    async create(userId: string, dto: CreateRecruiterDto): Promise<Result<{ id: number }>> {
        const existing = await this.recruiterDao.readContextByUserId(userId);
        if (existing) {
        return new Result<{ id: number }>(true, ResultCode.Conflict, "Profile already exists");
        }

        const { company, ...profile } = dto;

        // One nested write: the company and the recruiter profile are created together or not at all
        return this.recruiterDao.create({
            ...profile,
            companyRole: "ADMIN", // the person who creates the company administers it
            user: { connect: { id: userId } },
            company: { create: { ...company, slug: makeSlug(company.name) } },
        });
    }

    async getMe(userId: string): Promise<Result<RecruiterResponse>> {
        const profile = await this.recruiterDao.readByUserId(userId);
        if (!profile) {
            return new Result<RecruiterResponse>(true, ResultCode.NotFound, "Complete your recruiter profile first");
        }
        return new Result(false, ResultCode.Success, "Profile fetched", profile);
    }

    async update(userId: string, dto: UpdateRecruiterDto): Promise<Result<{ id: number }>> {
        const profile = await this.recruiterDao.readContextByUserId(userId);
        if (!profile) {
            return new Result<{ id: number }>(true, ResultCode.NotFound, "Complete your recruiter profile first");
        }
        return this.recruiterDao.update(profile.id, dto);
    }

    // Used by other services (jobs, applications) to find "who is this recruiter"
    async getContext(userId: string): Promise<Result<RecruiterContext>> {
        const ctx = await this.recruiterDao.readContextByUserId(userId);
        if (!ctx) {
            return new Result<RecruiterContext>(true, ResultCode.NotFound, "Complete your recruiter profile first");
        }
        return new Result(false, ResultCode.Success, "Profile found", ctx);
    }

    async getMyPostings(userId: string, page: number, limit: number): Promise<ResultWithCount<JobPostingItem[]>> {
        try {
            const profile = await this.recruiterDao.readContextByUserId(userId);
            if (!profile) {
                return new ResultWithCount<JobPostingItem[]>(true, ResultCode.NotFound, "Complete your recruiter profile first", undefined, null);
            }

            const result = await this.jobsDao.readMany<JobPostingItem>({ 
                where: {
                    postedById: profile.id
                },
                select: jobPostingSelect,
                page,
                count: limit
            })

            if (result.status.error || !result.result) {
                return new ResultWithCount<JobPostingItem[]>(
                true, result.status.code, result.message, undefined, null,
                );
            }

            return new ResultWithCount(false, ResultCode.Success, "Job Postings fetched successfully", result.result, result.count)
        } catch (error) {
            console.log(error);
            return new ResultWithCount<JobPostingItem[]>(true, ResultCode.InternalServerError, "Internal Server Error", undefined, null);
        }
    }
}