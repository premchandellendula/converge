import { Router } from "express";
import type { JobController } from "./job.controller.js";

export function createJobRouter(controller: JobController): Router {
    const router = Router();
    router.get("/:id", controller.getById);
    router.post("/", controller.create);
    return router;
}