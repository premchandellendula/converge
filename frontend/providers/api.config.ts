export const API_PREFIX = "/api/v1";

const BACKEND_URL = process.env.API_URL ?? "http://localhost:8080";

export const API_BASE = typeof window === "undefined" ? `${BACKEND_URL}${API_PREFIX}` : API_PREFIX;

export const isProduction = process.env.NODE_ENV === "production";