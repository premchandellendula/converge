import type { Result, ResultWithCount } from "../../shared/result/result.js";
import { jobSelect, type JobDao, type JobResponse } from "./job.dao.js";
import type { CreateJobDto, ListJobsQuery, UpdateJobDto } from "./job.schema.js";

export class JobService {
    constructor(private readonly jobDao: JobDao) {}

    create(postedById: number, dto: CreateJobDto): Promise<Result<{ id: number }>> {
        return this.jobDao.create({ ...dto, postedById });
    }

    getById(id: number): Promise<Result<JobResponse>> {
        return this.jobDao.read<JobResponse>(id, jobSelect);
    }

    list(query: ListJobsQuery): Promise<ResultWithCount<JobResponse[]>> {
        return this.jobDao.search(query);
    }

    update(id: number, dto: UpdateJobDto): Promise<Result<{ id: number }>> {
        return this.jobDao.update(id, dto);
    }
}