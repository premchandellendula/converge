import { Router } from "express";
import { createJobRouter } from "../job/job.routes.js";
import type { Container } from "../../container.js";
import { createUserRouter } from "../user/user.routes.js";
import { createApplicantRouter } from "../applicant/applicant.routes.js";
import { createRecruiterRouter } from "../recruiter/recruiter.routes.js";
import { createCompanyRouter } from "../company/company.routes.js";


export function createV1Router(c: Container): Router {
    const router = Router();
    router.use("/users", createUserRouter(c.userController));
    router.use("/jobs", createJobRouter(c.jobController));
    router.use("/applicants", createApplicantRouter(c.applicantController));
    router.use("/recruiters", createRecruiterRouter(c.recruiterController));
    router.use("/companies", createCompanyRouter(c.companyController));
    return router;
}