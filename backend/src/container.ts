import { RefreshTokenDao } from "./app/auth/refreshToken.dao.js";
import { JobController } from "./app/job/job.controller.js";
import { JobDao } from "./app/job/job.dao.js";
import { JobService } from "./app/job/job.service.js";
import { UserController } from "./app/user/user.controller.js";
import { UserDao } from "./app/user/user.dao.js";
import { UserService } from "./app/user/user.service.js";
import type { PrismaClient } from "./generated/prisma/client.js";

export function buildContainer(prisma: PrismaClient){
    const jobDao = new JobDao(prisma);
    const userDao = new UserDao(prisma);
    const refreshTokenDao = new RefreshTokenDao(prisma);

    const jobService = new JobService(jobDao);
    const userService = new UserService(userDao, refreshTokenDao);

    const jobController = new JobController(jobService);
    const userController = new UserController(userService);

    return { jobController, userController }
}

export type Container = ReturnType<typeof buildContainer>;