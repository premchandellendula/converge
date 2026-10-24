import express, { type Request, type Response } from "express";
import type { Container } from "./container.js";
import { errorHandler } from "./shared/middleware/error-handler.js";
import { createV1Router } from "./app/routes/v1.js";
import cookieParser from "cookie-parser";
import { authMiddleware } from "./shared/middleware/auth.js";
import { globalLimiter } from "./shared/middleware/rate-limit.js";

export function createApp(container: Container){
    const app = express();
    app.use(express.json());
    app.use(cookieParser());
    app.use(authMiddleware);
    app.set("trust proxy", 1);  
    
    app.get("/health", (req: Request, res: Response) => {
        res.status(200).json({
            success: true,
            message: "Converge API is running"
        })
    })
    app.use(globalLimiter);
    app.use("/api/v1", createV1Router(container));
    app.use(errorHandler);
    return app;
}