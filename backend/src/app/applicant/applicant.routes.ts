import { Router } from "express";
import { requireRole } from "../../shared/middleware/auth.js";
import type { ApplicantController } from "./applicant.controller.js";
import { uploadSingleFile } from "../../shared/middleware/upload.js";

export function createApplicantRouter(c: ApplicantController): Router {
    const router = Router();
    const candidateOnly = requireRole("Candidate");
    router.post("/me", requireRole("Candidate"), c.create);
    router.get("/me", requireRole("Candidate"), c.getMe);
    router.patch("/me", requireRole("Candidate"), c.update);
    router.post("/jobs/:id/applications", candidateOnly, c.apply);
    router.get("/applications/me", candidateOnly, c.listMine);
    router.patch("/applications/:id/withdraw", candidateOnly, c.withdrawApplication);
    router.get("/me/resumes", requireRole("Candidate"), c.update);
    router.post("/me/resumes", requireRole("Candidate"), c.update);
    router.delete("/me/resumes/:id", requireRole("Candidate"), c.update);
    router.get("/me/saved-jobs", requireRole("Candidate"), c.update);
    router.post("/me/saved-jobs/:id", requireRole("Candidate"), c.update);
    router.delete("/me/saved-jobs/:id", requireRole("Candidate"), c.update);
    router.post("/me/resumes", candidateOnly, uploadSingleFile, c.uploadResume);

    return router;
}