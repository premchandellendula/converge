import { Router } from "express";
import { requireRole } from "../../shared/middleware/auth.js";
import type { ApplicantController } from "./applicant.controller.js";

export function createApplicantRouter(c: ApplicantController): Router {
    const router = Router();
    router.post("/me", requireRole("Candidate"), c.create);
    router.get("/me", requireRole("Candidate"), c.getMe);
    router.patch("/me", requireRole("Candidate"), c.update);
    return router;
}