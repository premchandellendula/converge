import type { Request, Response } from "express";
import { Result, ResultCode } from "../../shared/result/result.js";
import type { RecruiterService } from "./recruiter.service.js";
import { createRecruiterSchema, pagingSchema, updateRecruiterSchema } from "./recruiter.schema.js";
import { jobIdParamSchema } from "../job/job.schema.js";
import { applicationIdParamSchema, listApplicationsQuerySchema, updateApplicationStatusSchema } from "../application/application.schema.js";

export class RecruiterController {
    constructor(private readonly service: RecruiterService) {}

    create = async (req: Request, res: Response) => {
        const parsed = createRecruiterSchema.safeParse(req.body);
        if (!parsed.success) {
            const r = new Result(true, ResultCode.BadRequest, "Incorrect inputs", parsed.error.issues);
            res.status(r.getStatus()).json(r);
            return;
        }
        const result = await this.service.create(req.user!.id, parsed.data);
        res.status(result.getStatus()).json(result);
    };

    getMe = async (req: Request, res: Response) => {
        const result = await this.service.getMe(req.user!.id);
        res.status(result.getStatus()).json(result);
    };

    update = async (req: Request, res: Response) => {
        const parsed = updateRecruiterSchema.safeParse(req.body);
        if (!parsed.success) {
            const r = new Result(true, ResultCode.BadRequest, "Incorrect inputs", parsed.error.issues);
            res.status(r.getStatus()).json(r);
            return;
        }
        const result = await this.service.update(req.user!.id, parsed.data);
        res.status(result.getStatus()).json(result);
    };

    getMyPostings = async (req: Request, res: Response) => {
        const parsed = pagingSchema.safeParse(req.query);
        if (!parsed.success) {
            const r = new Result(true, ResultCode.BadRequest, "Incorrect inputs", parsed.error.issues);
            res.status(r.getStatus()).json(r);
            return;
        }
        const result = await this.service.getMyPostings(req.user!.id, parsed.data.page, parsed.data.limit);
        res.status(result.getStatus()).json(result);
    }

    getJobApplications = async (req: Request, res: Response) => {
        const params = jobIdParamSchema.safeParse(req.params);
        const query = listApplicationsQuerySchema.safeParse(req.query);
        if (!params.success || !query.success) {
            const issues = [
            ...(params.success ? [] : params.error.issues),
            ...(query.success ? [] : query.error.issues),
            ];
            const r = new Result(true, ResultCode.BadRequest, "Incorrect inputs", issues);
            res.status(r.getStatus()).json(r);
            return;
        }
        const { status, page, limit } = query.data;
        const result = await this.service.getJobApplications(req.user!.id, params.data.id, status, page, limit);
        res.status(result.getStatus()).json(result);
    };

    updateApplicationStatus = async (req: Request, res: Response) => {
        const params = applicationIdParamSchema.safeParse(req.params);
        const body = updateApplicationStatusSchema.safeParse(req.body);
        if (!params.success || !body.success) {
            const issues = [
            ...(params.success ? [] : params.error.issues),
            ...(body.success ? [] : body.error.issues),
            ];
            const r = new Result(true, ResultCode.BadRequest, "Incorrect inputs", issues);
            res.status(r.getStatus()).json(r);
            return;
        }
        const result = await this.service.updateApplicationStatus(req.user!.id, params.data.id, body.data.status);
        res.status(result.getStatus()).json(result);
    };
}