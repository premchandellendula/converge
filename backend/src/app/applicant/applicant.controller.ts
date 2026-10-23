import type { Request, Response } from "express";
import { Result, ResultCode } from "../../shared/result/result.js";
import type { ApplicantService } from "./applicant.service.js";
import { applicationIdParamSchema, applyToJobSchema, createApplicantSchema, jobParamSchema, updateApplicantSchema } from "./applicant.schema.js";
import { pagingSchema } from "../recruiter/recruiter.schema.js";

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

    apply = async (req: Request, res: Response) => {
        const params = jobParamSchema.safeParse(req.params);
        const body = applyToJobSchema.safeParse(req.body ?? {});

        if (!params.success || !body.success) {
            const issues = [
                ...(params.success ? [] : params.error.issues),
                ...(body.success ? [] : body.error.issues),
            ];
            const r = new Result(true, ResultCode.BadRequest, "Incorrect inputs", issues);
            res.status(r.getStatus()).json(r);
            return;
        }

        const result = await this.service.apply(req.user!.id, params.data.id, body.data);
        res.status(result.getStatus()).json(result);
    };

    listMine = async (req: Request, res: Response) => {
        const parsed = pagingSchema.safeParse(req.query);
        if (!parsed.success) {
            const r = new Result(true, ResultCode.BadRequest, "Incorrect inputs", parsed.error.issues);
            res.status(r.getStatus()).json(r);
            return;
        }
        const result = await this.service.listMine(req.user!.id, parsed.data.page, parsed.data.limit);
        res.status(result.getStatus()).json(result);
    };

    withdrawApplication = async (req: Request, res: Response) => {
        const params = applicationIdParamSchema.safeParse(req.params);
        if (!params.success) {
            const r = new Result(true, ResultCode.BadRequest, "Incorrect inputs", params.error.issues);
            res.status(r.getStatus()).json(r);
            return;
        }

        const result = await this.service.withdrawApplication(req.user!.id, params.data.id);
        res.status(result.getStatus()).json(result);
    };

    uploadResume = async (req: Request, res: Response) => {
        const result = await this.service.uploadResume(req.user!.id, req.file);
        res.status(result.getStatus()).json(result);
    };
}