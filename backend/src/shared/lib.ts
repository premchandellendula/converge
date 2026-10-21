import crypto from "node:crypto";
import { z } from "zod";
import { Currency } from "../generated/prisma/enums.js";

const supported = new Set(Intl.supportedValuesOf("currency"));

export const currencySchema = z.enum(Currency);


// "Acme Tech Pvt. Ltd." -> "acme-tech-pvt-ltd-a1b2c3"
export function makeSlug(name: string): string {
    const base =
        name
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "") // strip accents
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 40) || "company";
    return `${base}-${crypto.randomBytes(3).toString("hex")}`; // random suffix keeps slugs unique
}