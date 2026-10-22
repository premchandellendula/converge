import { Router } from "express";
import { requireRole } from "../../shared/middleware/auth.js";
import type { RecruiterController } from "./recruiter.controller.js";

export function createRecruiterRouter(c: RecruiterController): Router {
    const router = Router();
    router.post("/me", requireRole("Recruiter"), c.create);
    router.get("/me", requireRole("Recruiter"), c.getMe);
    router.patch("/me", requireRole("Recruiter"), c.update);
    router.get("/postings", requireRole("Recruiter"), c.getMyPostings)
    router.get("/postings/:jobId/applications", requireRole("Recruiter"), c.getJobApplications);
    router.patch("/applications/:id/status", requireRole("Recruiter"), c.updateApplicationStatus);
    return router;
}