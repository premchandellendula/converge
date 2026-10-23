import type { Request, Response } from "express";
import type { CompanyService } from "./company.service.js";
import { companyIdParamSchema, companyJobsQuerySchema, updateCompanySchema } from "./company.schema.js";
import { Result, ResultCode } from "../../shared/result/result.js";

export class CompanyController {
    constructor(
        private readonly service: CompanyService
    ){}

    getCompany = async (req: Request, res: Response) => {
        const response = companyIdParamSchema.safeParse(req.body);
        if(!response.success){
            const result = new Result(true, ResultCode.BadRequest, "Incorrect inputs")
            res.status(result.getStatus()).json(result);
            return;
        }

        const result = await this.service.getById(response.data.id);
        res.status(result.getStatus()).json(result);
    }

    getJobsByCompany = async (req: Request, res: Response) => {
        const params = companyIdParamSchema.safeParse(req.params);
        const query = companyJobsQuerySchema.safeParse(req.query);
        if (!params.success || !query.success) {
            const issues = [
                ...(params.success ? [] : params.error.issues),
                ...(query.success ? [] : query.error.issues),
            ];
            const r = new Result(true, ResultCode.BadRequest, "Incorrect inputs", issues);
            res.status(r.getStatus()).json(r);
            return;
        }


        const result = await this.service.getJobs(params.data.id, query.data.page, query.data.limit);
        res.status(result.getStatus()).json(result);
    }

    updateCompany = async (req: Request, res: Response) => {
        const params = companyIdParamSchema.safeParse(req.params);
        const body = updateCompanySchema.safeParse(req.body);
        if (!params.success || !body.success) {
            const issues = [
                ...(params.success ? [] : params.error.issues),
                ...(body.success ? [] : body.error.issues),
            ];
            const r = new Result(true, ResultCode.BadRequest, "Incorrect inputs", issues);
            res.status(r.getStatus()).json(r);
            return;
        }


        const result = await this.service.update(req.user!.id, params.data.id, body.data);
        res.status(result.getStatus()).json(result);
    };
}