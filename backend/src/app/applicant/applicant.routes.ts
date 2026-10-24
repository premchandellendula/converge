import { Router } from "express";
import { requireRole } from "../../shared/middleware/auth.js";
import type { ApplicantController } from "./applicant.controller.js";
import { uploadSingleFile } from "../../shared/middleware/upload.js";
import { uploadLimiter } from "../../shared/middleware/rate-limit.js";

export function createApplicantRouter(c: ApplicantController): Router {
    const router = Router();
    const candidateOnly = requireRole("Candidate");
    router.post("/me", requireRole("Candidate"), c.create);
    router.get("/me", requireRole("Candidate"), c.getMe);
    router.patch("/me", requireRole("Candidate"), c.update);

    router.get("/me/resumes", requireRole("Candidate"), c.listResumes);
    router.post("/me/resumes", requireRole("Candidate"), uploadLimiter, uploadSingleFile, c.uploadResume);
    router.get("/me/resumes/:id/link", requireRole("Candidate"), c.getResumeLink);
    router.delete("/me/resumes/:id", requireRole("Candidate"), c.deleteResume);

    router.post("/jobs/:id/applications", candidateOnly, c.apply);
    router.get("/applications/me", candidateOnly, c.listMine);
    router.patch("/applications/:id/withdraw", candidateOnly, c.withdrawApplication);

    router.get("/me/saved-jobs", requireRole("Candidate"), c.listSavedJobs);
    router.post("/me/saved-jobs/:id", requireRole("Candidate"), c.saveJob);
    router.delete("/me/saved-jobs/:id", requireRole("Candidate"), c.unsaveJob);

    return router;
}