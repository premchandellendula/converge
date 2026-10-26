function required(name: string): string {
    const value = process.env[name];
    if(!value) throw new Error(`Missing environment variable: ${name}`)
    return value;
}

export const env = {
    supabaseUrl: required("SUPABASE_URL"),
    supabaseKey: required("SUPABASE_SERVICE_ROLE_KEY"),
    corsOrigins: (process.env.CORS_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
}