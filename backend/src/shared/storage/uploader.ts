import { Result, ResultCode } from "../result/result.js";
import type { BucketName, FileStorage } from "./file-storage.js";
import crypto from "node:crypto";
import { fileTypeFromBuffer } from "file-type";
import sharp from "sharp";

export interface UploadRule {
    bucket: BucketName;
    folder: string;
    allowed: Record<string, string>;
    maxBytes: number;
    image?: { maxWidth: number; maxHeight: number };
}

export const UPLOAD_RULES = {
    resume: {
        bucket: "resume",
        folder: "resume",
        allowed: { "application/pdf": "pdf" },
        maxBytes: 5 * 1024 * 1024
    },
    avatar: {
        bucket: "public-assets", 
        folder: "avatars",
        allowed: { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" },
        maxBytes: 2 * 1024 * 1024,
        image: { maxWidth: 512, maxHeight: 512 },
    },
    logo: {
        bucket: "public-assets", 
        folder: "logos",
        allowed: { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" },
        maxBytes: 2 * 1024 * 1024,
        image: { maxWidth: 800, maxHeight: 800 },
    },
} satisfies Record<string, UploadRule>;

export class FileUploader {
    constructor(private readonly storage: FileStorage){}

    async upload(file: { buffer: Buffer }, rule: UploadRule): Promise<Result<{ key: string}>> {
        const fail = (code: ResultCode, message: string) => new Result<{ key: string }>(true, code, message);

        if (file.buffer.length === 0) return fail(ResultCode.BadRequest, "The file is empty");
        if (file.buffer.length > rule.maxBytes) {
            return fail(ResultCode.BadRequest, `File is too large (max ${rule.maxBytes / 1024 / 1024} MB)`);
        }

        const detected = await fileTypeFromBuffer(file.buffer);
        if (!detected || !(detected.mime in rule.allowed)) {
            return fail(ResultCode.BadRequest, `Unsupported file type. Allowed: ${Object.keys(rule.allowed).join(", ")}`);
        }

        let body = file.buffer;
        let ext = rule.allowed[detected.mime];
        let contentType = detected.mime;

        if (rule.image) {
            try {
                body = await sharp(file.buffer)
                .rotate()
                .resize({ width: rule.image.maxWidth, height: rule.image.maxHeight, fit: "inside", withoutEnlargement: true })
                .webp({ quality: 80 })
                .toBuffer();
                ext = "webp";
                contentType = "image/webp";
            } catch {
                return fail(ResultCode.BadRequest, "Invalid image");
            }
        }

        const key = `${rule.folder}/${crypto.randomUUID()}.${ext}`;
        try {
            await this.storage.put(rule.bucket, key, body, contentType);
        } catch (error) {
            console.error(error);
            return fail(ResultCode.InternalServerError, "Could not store the file");
        }
        return new Result(false, ResultCode.Created, "File uploaded", { key });
    }

    async discard(bucket: BucketName, key: string) {
        await this.storage.remove(bucket, key).catch((e) => console.error("Cleanup failed", e));
    }
}