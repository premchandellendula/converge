import { Result, ResultCode } from "../../shared/result/result.js";
import type { EducationDao } from "../education/education.dao.js";
import type { SkillDao } from "../skill/skill.dao.js";
import type { ApplicantDao, ApplicantResponse } from "./applicant.dao.js";
import type { CreateApplicantDto, UpdateApplicantDto } from "./applicant.schema.js";

export class ApplicantService {
    constructor(
        private readonly applicantDao: ApplicantDao,
        private readonly educationDao: EducationDao,
        private readonly skillDao: SkillDao,
    ) {}

    async create(userId: string, dto: CreateApplicantDto): Promise<Result<{ id: number }>> {
        const existing = await this.applicantDao.readIdByUserId(userId);
        if (existing) {
            return new Result<{ id: number }>(true, ResultCode.Conflict, "Profile already exists");
        }

        const { skills, educations, ...profile } = dto;
        const skillIds = await this.skillDao.idsForNames(skills ?? []);

        return this.applicantDao.create({
            ...profile,
            user: { connect: { id: userId } },
            skills: { connect: skillIds },
            educations: { create: educations ?? [] },
        });
    }

    async getMe(userId: string): Promise<Result<ApplicantResponse>> {
        const profile = await this.applicantDao.readByUserId(userId);
        if (!profile) {
            return new Result<ApplicantResponse>(true, ResultCode.NotFound, "Complete your applicant profile first");
        }
        return new Result(false, ResultCode.Success, "Profile fetched", profile);
    }

    async update(userId: string, dto: UpdateApplicantDto): Promise<Result<{ id: number }>> {
        const profile = await this.applicantDao.readIdByUserId(userId);
        if (!profile) {
            return new Result<{ id: number }>(true, ResultCode.NotFound, "Complete your applicant profile first");
        }

        const { skills, educations, ...fields } = dto;
        const data: Parameters<ApplicantDao["update"]>[1] = { ...fields };
        if (skills) data.skills = { set: await this.skillDao.idsForNames(skills) }; // replaces the list

        const updated = await this.applicantDao.update(profile.id, data);
        if (updated.status.error) return updated;

        if (educations) await this.educationDao.replaceForApplicant(profile.id, educations);
        return updated;
    }

    // Used by other services (for example applications) to find "who is this applicant"
    async getProfileId(userId: string): Promise<Result<{ id: number }>> {
        const profile = await this.applicantDao.readIdByUserId(userId);
        if (!profile) {
        return new Result<{ id: number }>(true, ResultCode.NotFound, "Complete your applicant profile first");
        }
        return new Result(false, ResultCode.Success, "Profile found", profile);
    }
}