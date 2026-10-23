import { ApplicantController } from "./app/applicant/applicant.controller.js";
import { ApplicantDao } from "./app/applicant/applicant.dao.js";
import { ApplicantService } from "./app/applicant/applicant.service.js";
import { ApplicationDao } from "./app/application/application.dao.js";
import { RefreshTokenDao } from "./app/auth/refreshToken.dao.js";
import { CompanyDao } from "./app/company/company.dao.js";
import { CompanyService } from "./app/company/company.service.js";
import { EducationDao } from "./app/education/education.dao.js";
import { JobController } from "./app/job/job.controller.js";
import { JobDao } from "./app/job/job.dao.js";
import { JobService } from "./app/job/job.service.js";
import { RecruiterController } from "./app/recruiter/recruiter.controller.js";
import { RecruiterDao } from "./app/recruiter/recruiter.dao.js";
import { RecruiterService } from "./app/recruiter/recruiter.service.js";
import { ResumeDao } from "./app/resume/resume.dao.js";
import { SkillDao } from "./app/skill/skill.dao.js";
import { UserController } from "./app/user/user.controller.js";
import { UserDao } from "./app/user/user.dao.js";
import { UserService } from "./app/user/user.service.js";
import type { PrismaClient } from "./generated/prisma/client.js";
import { env } from "./config/env.js";
import { SupabaseFileStorage } from "./shared/storage/supabase.storage.js";
import { CompanyController } from "./app/company/company.controller.js";
import { FileUploader } from "./shared/storage/uploader.js";

export function buildContainer(prisma: PrismaClient){
    const storage = new SupabaseFileStorage(env.supabaseUrl, env.supabaseKey);
    const uploader = new FileUploader(storage);
    
    const userDao = new UserDao(prisma);
    const refreshTokenDao = new RefreshTokenDao(prisma);
    const skillDao = new SkillDao(prisma);
    const educationDao = new EducationDao(prisma);
    const applicantDao = new ApplicantDao(prisma);
    const recruiterDao = new RecruiterDao(prisma);
    const jobDao = new JobDao(prisma);
    const applicationDao = new ApplicationDao(prisma);
    const resumeDao = new ResumeDao(prisma);
    const companyDao = new CompanyDao(prisma);

    const recruiterService = new RecruiterService(recruiterDao, jobDao, applicationDao, companyDao, storage);
    const jobService = new JobService(jobDao, recruiterService, skillDao);
    const userService = new UserService(userDao, refreshTokenDao);
    const applicantService = new ApplicantService(applicantDao, educationDao, skillDao, applicationDao, jobService, resumeDao, uploader);
    const companyService = new CompanyService(companyDao, recruiterService, jobDao)

    const jobController = new JobController(jobService);
    const userController = new UserController(userService);
    const applicantController = new ApplicantController(applicantService);
    const recruiterController = new RecruiterController(recruiterService);
    const companyController = new CompanyController(companyService);

    return { jobController, userController, applicantController, recruiterController, companyController }
}

export type Container = ReturnType<typeof buildContainer>;