import { Router } from "express";
import { createJobRouter } from "../job/job.routes.js";
import type { Container } from "../../container.js";
import { createUserRouter } from "../user/user.routes.js";


export function createV1Router(c: Container): Router {
    const router = Router();
    router.use("/users", createUserRouter(c.userController));
    router.use("/jobs", createJobRouter(c.jobController));
    return router;
}