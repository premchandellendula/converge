import { Result, ResultCode } from "../../shared/result/result.js";
import type { SkillDao } from "./skill.dao.js";

export class SkillService {
    constructor(private readonly skillDao: SkillDao) {}

    async search(q: string, limit: number): Promise<Result<{ id: number; name: string }[]>> {
        const skills = await this.skillDao.search(q, limit);
        return new Result(false, ResultCode.Success, "Skills fetched", skills);
    }
}