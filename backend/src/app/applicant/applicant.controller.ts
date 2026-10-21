import type { Request, Response } from "express";
import { Result, ResultCode } from "../../shared/result/result.js";
import type { ApplicantService } from "./applicant.service.js";
import { createApplicantSchema, updateApplicantSchema } from "./applicant.schema.js";

export class ApplicantController {
    constructor(private readonly service: ApplicantService) {}

    create = async (req: Request, res: Response) => {
        const parsed = createApplicantSchema.safeParse(req.body);
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
        const parsed = updateApplicantSchema.safeParse(req.body);
        if (!parsed.success) {
            const r = new Result(true, ResultCode.BadRequest, "Incorrect inputs", parsed.error.issues);
            res.status(r.getStatus()).json(r);
            return;
        }
        const result = await this.service.update(req.user!.id, parsed.data);
        res.status(result.getStatus()).json(result);
    };
}