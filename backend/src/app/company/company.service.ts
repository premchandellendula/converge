import { Result, ResultCode, ResultWithCount } from "../../shared/result/result.js";
import type { JobDao, JobListItem } from "../job/job.dao.js";
import type { RecruiterService } from "../recruiter/recruiter.service.js";
import { companySelect, type CompanyDao, type CompanyResponse } from "./company.dao.js";
import type { UpdateCompanyDto } from "./company.schema.js";

export class CompanyService {
    constructor(
        private readonly companyDao: CompanyDao,
        private readonly recruiterService: RecruiterService,
        private readonly jobDao : JobDao
    ){}

    getById(id: number): Promise<Result<CompanyResponse>>{
        return this.companyDao.read<CompanyResponse>(id, companySelect);
    }

    async getJobs(companyId: number, page: number, limit: number): Promise<ResultWithCount<JobListItem[]>>{
        const company = await this.companyDao.read<{ id: number }>(companyId, { id: true });
        if (company.status.error || !company.result) {
        return new ResultWithCount<JobListItem[]>(true, company.status.code, company.message, undefined, null);
        }
        return this.jobDao.readOpenByCompany(companyId, page, limit);
    }

    async update(userId: string, companyId: number, dto: UpdateCompanyDto): Promise<Result<{ id: number }>> {
        const fail = (code: ResultCode, message: string) => new Result<{ id: number }>(true, code, message);

        const ctx = await this.recruiterService.getContext(userId);
        if (ctx.status.error || !ctx.result) return fail(ctx.status.code, ctx.message ?? "Recruiter profile not found");

        if (ctx.result.companyId !== companyId || ctx.result.companyRole !== "ADMIN") {
            return fail(ResultCode.Forbidden, "Only an admin of this company can edit it");
        }

        if (dto.name && (await this.companyDao.existsByName(dto.name, companyId))) {
            return fail(ResultCode.Conflict, "A company with this name already exists");
        }

        return this.companyDao.update(companyId, dto);
    }
}