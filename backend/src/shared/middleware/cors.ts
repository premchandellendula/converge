import cors from 'cors';
import { env } from '../../config/env.js';

export const corsMiddleware = cors({
    origin(origin, callback){
        if(!origin || env.corsOrigins.includes(origin)) return callback(null, true);
        return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    maxAge: 600
})