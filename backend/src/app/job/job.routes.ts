import { Router } from "express";
import type { JobController } from "./job.controller.js";
import { requireRole } from "../../shared/middleware/auth.js";

export function createJobRouter(controller: JobController): Router {
    const router = Router();
    const recruiterOnly = requireRole("Recruiter");

    router.post("/", recruiterOnly, controller.create);
    router.get("/", controller.list);
    router.get("/facets", controller.facets);
    router.get("/:id", controller.getById);
    router.patch("/:id", recruiterOnly, controller.update);
    return router;
}