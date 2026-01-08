import crypto from "crypto";
import path from "path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { StorageAdapter, UploadResult } from "./types";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

function normalizeEndpoint(endpoint: string): string {
  const trimmed = endpoint.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

function ensureHttps(endpoint: string): string {
  if (endpoint.startsWith("https://")) {
    return endpoint;
  }
  if (endpoint.startsWith("http://")) {
    return `https://${endpoint.slice("http://".length)}`;
  }
  return `https://${endpoint}`;
}

export class YandexStorageAdapter implements StorageAdapter {
  private client: S3Client;
  private bucket: string;
  private publicBaseUrl: string;

  constructor() {
    const accessKeyId = requireEnv("YC_ACCESS_KEY_ID");
    const secretAccessKey = requireEnv("YC_SECRET_ACCESS_KEY");
    const bucket = requireEnv("YC_BUCKET");
    const region = requireEnv("YC_REGION");
    const endpoint = normalizeEndpoint(requireEnv("YC_ENDPOINT"));

    this.client = new S3Client({
      region,
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: true,
    });
    this.bucket = bucket;

    const publicEndpoint = ensureHttps(endpoint).replace(/\/+$/, "");
    this.publicBaseUrl = `${publicEndpoint}/${bucket}`;
  }

  async uploadFile(file: File): Promise<UploadResult> {
    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = path.extname(file.name);
    const filename = `${crypto.randomUUID()}${ext}`;
    const mimeType = file.type || "application/octet-stream";

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: filename,
        Body: buffer,
        ContentType: mimeType,
        ACL: "public-read",
      })
    );

    return {
      storageKey: filename,
      url: `${this.publicBaseUrl}/${filename}`,
      size: buffer.length,
      mimeType,
    };
  }
}
