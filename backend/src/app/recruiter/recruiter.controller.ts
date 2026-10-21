import type { Request, Response } from "express";
import { Result, ResultCode } from "../../shared/result/result.js";
import type { RecruiterService } from "./recruiter.service.js";
import { createRecruiterSchema, pagingSchema, updateRecruiterSchema } from "./recruiter.schema.js";

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
}