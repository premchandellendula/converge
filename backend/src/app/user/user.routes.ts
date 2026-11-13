import { Router } from "express";
import type { UserController } from "./user.controller.js";
import { requireRole } from "../../shared/middleware/auth.js";
import { loginLimiter, mailLimiter, refreshLimiter, signupLimiter } from "../../shared/middleware/rate-limit.js";
import rateLimit from "express-rate-limit";

export function createUserRouter(controller: UserController): Router {
    const router = Router();
    router.post("/signup", signupLimiter, controller.signup);
    router.post("/login", loginLimiter, controller.login);
    router.post("/refresh", refreshLimiter, controller.refresh);
    router.post("/logout", controller.logout);
    router.get("/me", requireRole("Candidate", "Recruiter"), controller.me);
    router.post("/verify-email", mailLimiter, controller.verifyEmail);                       // public: the link in the email
    router.post("/resend-verification", requireRole("Candidate", "Recruiter"), mailLimiter, controller.resendVerification); // logged in. Use your own "any logged-in user" middleware here
    router.post("/forgot-password", mailLimiter, controller.forgotPassword);                 // public
    router.post("/reset-password", mailLimiter, controller.resetPassword); 
    return router;
}