import type { Request, Response } from "express";
import { skillSearchQuerySchema } from "./skill.schema.js";
import type { SkillService } from "./skill.service.js";
import { Result, ResultCode } from "../../shared/result/result.js";

export class SkillController {
    constructor(private readonly service: SkillService) {}

    search = async (req: Request, res: Response) => {
        const query = skillSearchQuerySchema.safeParse(req.query);
        if (!query.success) {
            const r = new Result(true, ResultCode.BadRequest, "Incorrect inputs", query.error.issues);
            res.status(r.getStatus()).json(r);
            return;
        }
        const result = await this.service.search(query.data.q, query.data.limit);
        res.status(result.getStatus()).json(result);
    };
}