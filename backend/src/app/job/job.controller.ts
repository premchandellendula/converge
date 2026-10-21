import type { Request, Response } from "express";
import type { JobService } from "./job.service.js";
import {
    createJobSchema,
    jobFiltersSchema,
    jobIdParamSchema,
    listJobsQuerySchema,
    updateJobSchema,
} from "./job.schema.js";
import { Result, ResultCode } from "../../shared/result/result.js";

export class JobController {
    constructor(private readonly jobService: JobService) {}

    create = async (req: Request, res: Response) => {
        const parsed = createJobSchema.safeParse(req.body);

        if(!parsed.success){
            const result = new Result(true, ResultCode.BadRequest, "Incorrect inputs", parsed.error);
            res.status(result.getStatus()).json();
            return;
        }

        const result = await this.jobService.create(req.user!.id, parsed.data);
        res.status(result.getStatus()).json(result);
    }

    getById = async (req: Request, res: Response) => {
        const { id } = jobIdParamSchema.parse(req.params);
        const result = await this.jobService.getById(id);
        res.status(result.getStatus()).json(result);
    };

    list = async (req: Request, res: Response) => {
        const parsed = listJobsQuerySchema.safeParse(req.query);
        if (!parsed.success) {
            const r = new Result(true, ResultCode.BadRequest, "Incorrect inputs", parsed.error.issues);
            res.status(r.getStatus()).json(r);
            return;
        }
        const result = await this.jobService.list(parsed.data);
        res.status(result.getStatus()).json(result);
    };

    facets = async (req: Request, res: Response) => {
        const parsed = jobFiltersSchema.safeParse(req.query);
        if (!parsed.success) {
            const r = new Result(true, ResultCode.BadRequest, "Incorrect inputs", parsed.error.issues);
            res.status(r.getStatus()).json(r);
            return;
        }
        const result = await this.jobService.facets(parsed.data);
        res.status(result.getStatus()).json(result);
    };

    update = async (req: Request, res: Response) => {
        const params = jobIdParamSchema.safeParse(req.params);
        const body = updateJobSchema.safeParse(req.body);

        if (!params.success || !body.success) {
            const issues = [
                ...(params.success ? [] : params.error.issues),
                ...(body.success ? [] : body.error.issues),
            ];
            const r = new Result(true, ResultCode.BadRequest, "Incorrect inputs", issues);
            res.status(r.getStatus()).json(r);
            return;
        }

        const result = await this.jobService.update(req.user!.id, params.data.id, body.data);
        res.status(result.getStatus()).json(result);
    };
}