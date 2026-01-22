import path from "node:path";
import { StorageAdapter } from "./types";

type S3ClientType = import("@aws-sdk/client-s3").S3Client;
type S3Module = typeof import("@aws-sdk/client-s3");

function normalizeEndpoint(endpoint: string): string {
  const trimmed = endpoint.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export class YandexStorageAdapter implements StorageAdapter {
  private client: S3ClientType | null = null;
  private bucket: string | null = null;
  private publicBaseUrl: string | null = null;
  private s3: S3Module | null = null;

  private requireEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
      throw new Error(`S3 config is missing: ${name}`);
    }
    return value;
  }

  private validateBucketName(bucket: string): void {
    if (
      bucket.includes("://") ||
      bucket.includes("/") ||
      bucket.includes("storage.yandexcloud.net")
    ) {
      throw new Error(
        "S3 config is invalid: S3_BUCKET must be a bucket name only"
      );
    }
  }

  private async getClient(): Promise<S3ClientType> {
    if (this.client) {
      return this.client;
    }

    const accessKeyId = this.requireEnv("S3_ACCESS_KEY");
    const secretAccessKey = this.requireEnv("S3_SECRET_KEY");
    const bucket = this.requireEnv("S3_BUCKET");
    const endpoint = normalizeEndpoint(this.requireEnv("S3_ENDPOINT"));
    const publicBaseUrl = this.requireEnv("S3_PUBLIC_URL").trim().replace(/\/+$/, "");

    this.validateBucketName(bucket);

    const s3 = await import("@aws-sdk/client-s3");
    const { S3Client } = s3;

    this.bucket = bucket;
    this.publicBaseUrl = publicBaseUrl;
    this.s3 = s3;
    this.client = new S3Client({
      region: "ru-central1",
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: true,
    });

    return this.client;
  }

  private async getS3Module(): Promise<S3Module> {
    if (this.s3) {
      return this.s3;
    }
    await this.getClient();
    if (!this.s3) {
      throw new Error("S3 module was not initialized");
    }
    return this.s3;
  }

  private getBucket(): string {
    if (!this.bucket) {
      throw new Error("S3 bucket is not configured");
    }
    return this.bucket;
  }

  private getPublicBaseUrl(): string {
    if (!this.publicBaseUrl) {
      throw new Error("S3 public URL is not configured");
    }
    return this.publicBaseUrl;
  }

  private normalizeObjectKey(filePath: string): string {
    const trimmed = filePath.replace(/^[/\\]+/, "").replace(/\\/g, "/");
    const allowedPrefixes = ["albums/", "videos/", "video-thumbnails/"];
    if (allowedPrefixes.some((prefix) => trimmed.startsWith(prefix))) {
      return trimmed;
    }
    return `albums/${trimmed}`;
  }

  private buildPublicUrl(objectKey: string): string {
    const base = this.getPublicBaseUrl().replace(/\/+$/, "");
    const key = objectKey.replace(/^\/+/, "");
    return `${base}/${key}`;
  }

  async presignUpload(options: {
    key: string;
    contentType: string;
    expiresInSeconds?: number;
  }): Promise<{ uploadUrl: string; publicUrl: string }> {
    const client = await this.getClient();
    const { PutObjectCommand } = await this.getS3Module();
    const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");

    const key = this.normalizeObjectKey(options.key);
    const command = new PutObjectCommand({
      Bucket: this.getBucket(),
      Key: key,
      ContentType: options.contentType,
    });

    const uploadUrl = await getSignedUrl(client, command, {
      expiresIn: options.expiresInSeconds ?? 600,
    });

    return { uploadUrl, publicUrl: this.buildPublicUrl(key) };
  }

  private getContentType(objectKey: string): string {
    const ext = path.extname(objectKey).toLowerCase();
    switch (ext) {
      case ".jpg":
      case ".jpeg":
        return "image/jpeg";
      case ".png":
        return "image/png";
      case ".webp":
        return "image/webp";
      case ".gif":
        return "image/gif";
      case ".bmp":
        return "image/bmp";
      case ".tif":
      case ".tiff":
        return "image/tiff";
      case ".avif":
        return "image/avif";
      case ".svg":
        return "image/svg+xml";
      case ".mp4":
        return "video/mp4";
      case ".mov":
        return "video/quicktime";
      default:
        return "application/octet-stream";
    }
  }

  async uploadFile(file: Buffer, filePath: string): Promise<string> {
    const client = await this.getClient();
    const { PutObjectCommand } = await this.getS3Module();

    const objectKey = this.normalizeObjectKey(filePath);
    const contentType = this.getContentType(objectKey);

    await client.send(
      new PutObjectCommand({
        Bucket: this.getBucket(),
        Key: objectKey,
        Body: file,
        ContentType: contentType,
      })
    );

    return this.buildPublicUrl(objectKey);
  }

  async deleteFile(filePath: string): Promise<void> {
    const client = await this.getClient();
    const { DeleteObjectCommand } = await this.getS3Module();
    const objectKey = this.normalizeObjectKey(filePath);

    await client.send(
      new DeleteObjectCommand({
        Bucket: this.getBucket(),
        Key: objectKey,
      })
    );
  }
}
