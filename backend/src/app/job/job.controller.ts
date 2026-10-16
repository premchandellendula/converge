import type { Request, Response } from "express";
import type { JobService } from "./job.service.js";
import {
    createJobSchema,
    jobIdParamSchema,
    updateJobSchema,
} from "./job.schema.js";

export class JobController {
    constructor(private readonly jobService: JobService) {}

    create = async (req: Request, res: Response) => {
        const dto = createJobSchema.parse(req.body);
        // postedById is the logged-in recruiter's RecruiterDetails id.
        // Add `profileId: number` to AuthUser and fill it in when you build real auth.
        const postedById = Number(req.user!.id);
        const result = await this.jobService.create(postedById, dto);
        res.status(result.getStatus()).json(result);
    };

    getById = async (req: Request, res: Response) => {
        const { id } = jobIdParamSchema.parse(req.params);
        const result = await this.jobService.getById(id);
        res.status(result.getStatus()).json(result);
    };

    update = async (req: Request, res: Response) => {
        const { id } = jobIdParamSchema.parse(req.params);
        const dto = updateJobSchema.parse(req.body);
        const result = await this.jobService.update(id, dto);
        res.status(result.getStatus()).json(result);
    };
}