export type BucketName = "resume" | "public-assets";

export interface FileStorage {
    put(bucket: BucketName, key: string, body: Buffer, contentType: string): Promise<void>;
    remove(bucket: BucketName, key: string): Promise<void>;
    publicUrl(bucket: BucketName, key: string): string;
    signedUrl(bucket: BucketName, key: string, expiresInSeconds: number): Promise<string>;
}