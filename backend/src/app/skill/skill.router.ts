import { Router } from "express";
import type { SkillController } from "./skill.controller.js";

export function createSkillRouter(controller: SkillController): Router{
    const router = Router();
    router.get("/", controller.search);
    return router;
}