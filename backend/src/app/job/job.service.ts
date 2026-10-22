import type { JobStatus, Prisma } from "../../generated/prisma/client.js";
import { Result, ResultCode, ResultWithCount } from "../../shared/result/result.js";
import type { RecruiterService } from "../recruiter/recruiter.service.js";
import type { SkillDao } from "../skill/skill.dao.js";
import { jobListSelect, type JobDao, type JobFacets, type JobListItem } from "./job.dao.js";
import type { CreateJobDto, JobFilters, ListJobsQuery, UpdateJobDto } from "./job.schema.js";

export class JobService {
    constructor(
        private readonly jobDao: JobDao,
        private readonly recruiterService: RecruiterService,
        private readonly skillDao: SkillDao,
    ) {}

    async create(userId: string, dto: CreateJobDto): Promise<Result<{ id: number }>> {
        const ctx = await this.recruiterService.getContext(userId);
        if(ctx.status.error || !ctx.result){
            return new Result<{ id: number }>(true, ctx.status.code, ctx.message)
        }

        const { skills, ...fields } = dto;
        const skillIds = await this.skillDao.idsForNames(skills ?? []);

        return this.jobDao.create({
            ...fields,
            companyId: ctx.result.companyId,
            postedById: ctx.result.id,
            skills: { connect: skillIds }
        });
    }

    getById(id: number): Promise<Result<JobListItem>> {
        return this.jobDao.read<JobListItem>(id, jobListSelect);
    }

    async list(query: ListJobsQuery): Promise<ResultWithCount<JobListItem[]>> {
        const { items, total } = await this.jobDao.search(query);
        return new ResultWithCount(false, ResultCode.Success, "Jobs fetched", items, total);
    }

    async facets(filters: JobFilters): Promise<Result<JobFacets>> {
        return new Result(false, ResultCode.Success, "Facets fetched", await this.jobDao.facets(filters));
    }

    async update(userId: string, jobId: number, dto: UpdateJobDto): Promise<Result<{ id: number }>> {
        const fail = (code: ResultCode, message: string) =>
            new Result<{ id: number }>(true, code, message);

        if (Object.keys(dto).length === 0) {
            return fail(ResultCode.BadRequest, "No fields to update");
        }

        const ctx = await this.recruiterService.getContext(userId);
        if (ctx.status.error || !ctx.result) return fail(ctx.status.code, ctx.message ?? "Recruiter profile not found");

        const found = await this.jobDao.read<{
            id: number; companyId: number; postedById: number;
            salaryMin: number | null; salaryMax: number | null;
            experienceMin: number | null; experienceMax: number | null;
        }>(jobId, {
            id: true, companyId: true, postedById: true,
            salaryMin: true, salaryMax: true, experienceMin: true, experienceMax: true,
        });
        if (found.status.error || !found.result) return fail(found.status.code, found.message ?? "Job not found");
        const job = found.result;

        const sameCompany = job.companyId === ctx.result.companyId;
        const canEdit = sameCompany && (job.postedById === ctx.result.id || ctx.result.companyRole === "ADMIN");
        if (!canEdit) return fail(ResultCode.Forbidden, "You cannot edit this job");

        const salaryMin = dto.salaryMin ?? job.salaryMin;
        const salaryMax = dto.salaryMax ?? job.salaryMax;
        if (salaryMin != null && salaryMax != null && salaryMin > salaryMax) {
            return fail(ResultCode.BadRequest, "salaryMin must not be greater than salaryMax");
        }
        const expMin = dto.experienceMin ?? job.experienceMin;
        const expMax = dto.experienceMax ?? job.experienceMax;
        if (expMin != null && expMax != null && expMin > expMax) {
            return fail(ResultCode.BadRequest, "experienceMin must not be greater than experienceMax");
        }

        const { skills, ...fields } = dto;
        const data: Prisma.JobUpdateInput = { ...fields };
        if (skills) data.skills = { set: await this.skillDao.idsForNames(skills) };

        return this.jobDao.update(jobId, data);
    }

    getForApply(id: number): Promise<Result<{ id: number; status: JobStatus; expiresAt: Date | null }>> {
        return this.jobDao.read<{ id: number; status: JobStatus; expiresAt: Date | null }>(id, {
            id: true,
            status: true,
            expiresAt: true,
        });
    }
}