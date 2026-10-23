import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { BucketName, FileStorage } from "./file-storage.js";

export class SupabaseFileStorage implements FileStorage {
    private readonly client: SupabaseClient;

    constructor(url: string, secretKey: string){
        this.client = createClient(url, secretKey, { auth: { persistSession: false }})
    }

    async put(bucket: BucketName, key: string, body: Buffer, contentType: string): Promise<void> {
        const { error } = await this.client.storage.from(bucket).upload(key, body, { contentType, upsert: false });
        if (error) throw new Error(`Upload failed: ${error.message}`);
    }

    async remove(bucket: BucketName, key: string): Promise<void> {
        const { error } = await this.client.storage.from(bucket).remove([key])
        if(error) throw new Error(`Delete failed: ${error.message}`);
    }

    publicUrl(bucket: BucketName, key: string) {
        return this.client.storage.from(bucket).getPublicUrl(key).data.publicUrl;
    }

    async signedUrl(bucket: BucketName, key: string, expiresInSeconds: number) {
        const { data, error } = await this.client.storage.from(bucket).createSignedUrl(key, expiresInSeconds);
        if (error || !data) throw new Error(`Could not sign URL: ${error?.message ?? "unknown error"}`);
        return data.signedUrl;
    }
}