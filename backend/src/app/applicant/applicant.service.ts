import path from "node:path";
import type { ApplicationStatus } from "../../generated/prisma/enums.js";
import { Result, ResultCode, ResultWithCount } from "../../shared/result/result.js";
import { FileUploader, UPLOAD_RULES } from "../../shared/storage/uploader.js";
import { applicationListSelect, type ApplicationDao, type ApplicationListItem } from "../application/application.dao.js";
import type { EducationDao } from "../education/education.dao.js";
import type { JobService } from "../job/job.service.js";
import type { ResumeDao } from "../resume/resume.dao.js";
import type { SkillDao } from "../skill/skill.dao.js";
import type { ApplicantDao, ApplicantResponse } from "./applicant.dao.js";
import type { ApplyToJobDto, CreateApplicantDto, UpdateApplicantDto } from "./applicant.schema.js";

const FINAL_STATUSES: ApplicationStatus[] = ["HIRED", "REJECTED", "WITHDRAWN"];

type ApplyContext = { applicantId: number; resumeId: number; resumeUrl: string };
const MAX_RESUMES = 5;

export class ApplicantService {
    constructor(
        private readonly applicantDao: ApplicantDao,
        private readonly educationDao: EducationDao,
        private readonly skillDao: SkillDao,
        private readonly applicationDao: ApplicationDao,
        private readonly jobService: JobService,
        private readonly resumeDao: ResumeDao,
        private readonly uploader: FileUploader
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

    async apply(userId: string, jobId: number, dto: ApplyToJobDto): Promise<Result<{ id: number }>> {
        const fail = (code: ResultCode, message: string) => new Result<{ id: number }>(true, code, message);

        const ctx = await this.getApplyContext(userId, dto.resumeId);
        if (ctx.status.error || !ctx.result) return fail(ctx.status.code, ctx.message ?? "Cannot apply");

        // 2. Can this job take applications right now?
        const job = await this.jobService.getForApply(jobId);
        if (job.status.error || !job.result) return fail(job.status.code, job.message ?? "Job not found");
        if (job.result.status !== "OPEN" || (job.result.expiresAt && job.result.expiresAt < new Date())) {
        return fail(ResultCode.Conflict, "This job is no longer accepting applications");
        }

        // 3. Friendly duplicate check (the unique constraint still guards against races)
        if (await this.applicationDao.readByJobAndApplicant(jobId, ctx.result.applicantId)) {
            return fail(ResultCode.Conflict, "You have already applied to this job");
        }

        // 4. Create it. status defaults to APPLIED in the schema
        return this.applicationDao.create({
            jobId,
            applicantId: ctx.result.applicantId,
            resumeId: ctx.result.resumeId,
            resumeUrl: ctx.result.resumeUrl,
            coverLetter: dto.coverLetter,
        });
    }

    async listMine(userId: string, page: number, limit: number): Promise<ResultWithCount<ApplicationListItem[]>> {
        const applicant = await this.getProfileId(userId);
        if (applicant.status.error || !applicant.result) {
        return new ResultWithCount<ApplicationListItem[]>(
            true, applicant.status.code, applicant.message, undefined, null,
        );
        }

        return this.applicationDao.readMany<ApplicationListItem>({
            where: { applicantId: applicant.result.id },
            select: applicationListSelect,
            page,
            count: limit, // newest first by default (createdAt desc)
        });
    }

    async getApplyContext(userId: string, resumeId?: number): Promise<Result<ApplyContext>> {
        const fail = (code: ResultCode, message: string) => new Result<ApplyContext>(true, code, message);

        const profile = await this.applicantDao.readIdByUserId(userId);
        if (!profile) return fail(ResultCode.NotFound, "Complete your applicant profile first");

        const resume = await this.resumeDao.readForApply(profile.id, resumeId);
        if (!resume) {
            return resumeId
                ? fail(ResultCode.NotFound, "Resume not found")
                : fail(ResultCode.BadRequest, "Upload a resume before applying");
        }

        return new Result(false, ResultCode.Success, "Ready to apply", {
            applicantId: profile.id,
            resumeId: resume.id,
            resumeUrl: resume.fileUrl,
        });
    }

    async withdrawApplication(userId: string, applicationId: number): Promise<Result<{ id: number }>>{
        try {
            const fail = (code: ResultCode, message: string) => new Result<{id: number}>(true, code, message);

            const profile = await this.applicantDao.readIdByUserId(userId);
            if (!profile) return fail(ResultCode.NotFound, "Complete your applicant profile first");

            const application = await this.applicationDao.read<{ applicantId: number; status: ApplicationStatus }>(applicationId, { applicationId: true, status: true})
            if (!application.result || application.result.applicantId !== profile.id) {
                return fail(ResultCode.NotFound, "Application not found");
            }
            const current = application.result.status;
            if (FINAL_STATUSES.includes(current)) {
                return fail(
                ResultCode.Conflict,
                current === "WITHDRAWN"
                    ? "You have already withdrawn this application"
                    : `This application is ${current.toLowerCase()} and can no longer be withdrawn`,
                );
            }

            return this.applicationDao.update(applicationId, { status: "WITHDRAWN" })
        } catch (error) {
            console.log(error);
            return new Result(true, ResultCode.InternalServerError, "Internal Server error")
        }
    }

    async uploadResume(userId: string, file: Express.Multer.File | undefined): Promise<Result<{ id: number }>>{
        const fail = (code: ResultCode, message: string) => new Result<{ id: number }>(true, code, message);

        if (!file) return fail(ResultCode.BadRequest, 'Attach a PDF in the "file" field');

        const profile = await this.applicantDao.readIdByUserId(userId);
        if (!profile) return fail(ResultCode.NotFound, "Complete your applicant profile first");

        if ((await this.resumeDao.countForApplicant(profile.id)) >= MAX_RESUMES) {
            return fail(ResultCode.Conflict, `You can keep at most ${MAX_RESUMES} resumes. Delete one first.`);
        }

        const uploaded = await this.uploader.upload(file, UPLOAD_RULES.resume);
        if (uploaded.status.error || !uploaded.result) {
            return fail(uploaded.status.code, uploaded.message ?? "Upload failed");
        }

        const created = await this.resumeDao.create({
            applicantId: profile.id,
            fileName: path.basename(file.originalname).replace(/[^\w.\- ]+/g, "_").slice(0, 100),
            fileUrl: uploaded.result.key,
        });
        if (created.status.error) {
            await this.uploader.discard("resume", uploaded.result.key); // don't leave an orphan file
            return fail(created.status.code, created.message ?? "Could not save the resume");
        }
        return created;
    }
}