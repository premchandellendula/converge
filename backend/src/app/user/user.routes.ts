import { Router } from "express";
import type { UserController } from "./user.controller.js";
import { requireRole } from "../../shared/middleware/auth.js";
import { loginLimiter, refreshLimiter, signupLimiter } from "../../shared/middleware/rate-limit.js";

export function createUserRouter(controller: UserController): Router {
    const router = Router();
    router.post("/signup", signupLimiter, controller.signup);
    router.post("/login", loginLimiter, controller.login);
    router.post("/refresh", refreshLimiter, controller.refresh);
    router.post("/logout", controller.logout);
    router.get("/me", requireRole("Candidate", "Recruiter"), controller.me);
    return router;
}