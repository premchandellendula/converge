import z from "zod";
import { Role } from "../../generated/prisma/enums.js";
import type { Prisma } from "../../generated/prisma/client.js";

export const createUserSchema = z.object({
    firstName: z.string().trim().min(2).max(50),
    lastName: z.string().trim().min(2).max(50),
    email: z.string().trim().toLowerCase().pipe(z.email()),
    phone: z.string().regex(/^\+[1-9]\d{6,14}$/, "Use international format, e.g. +919876543210").optional(),
    password: z.string().min(8).max(128),
    role: z.enum(Role),
    gender: z.string().trim().max(30).optional(),
    avatarUrl: z.url().optional(),
}).strict();

export const updateUserSchema = z
    .object({
        firstName: z.string().trim().min(2).max(50),
        lastName: z.string().trim().min(2).max(50),
        phone: z.string().regex(/^\+[1-9]\d{6,14}$/).nullable(),
        gender: z.string().trim().max(30).nullable(),
        avatarUrl: z.url().nullable(),
    })
    .partial()
    .strict();

export const userSelect = {
    id: true,
    firstName: true,
    lastName: true,
    email: true,
    phone: true,
    role: true,
    avatarUrl: true,
    isEmailVerified: true,
    isPhoneVerified: true,
    createdAt: true,
} satisfies Prisma.UserSelect;

export type CreateUserDto = z.infer<typeof createUserSchema>;

export const loginSchema = z.object({
    email: z.string().trim().toLowerCase().pipe(z.email()),
    password: z.string().min(1).max(72),
});
export type LoginDto = z.infer<typeof loginSchema>;