import { StorageAdapter } from "./types";

type S3ClientType = import("@aws-sdk/client-s3").S3Client;

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
  private endpoint: string | null = null;

  private requireEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
      throw new Error(`Missing environment variable: ${name}`);
    }
    return value;
  }

  private async getClient(): Promise<S3ClientType> {
    if (this.client) {
      return this.client;
    }

    const accessKeyId = this.requireEnv("YC_ACCESS_KEY");
    const secretAccessKey = this.requireEnv("YC_SECRET_KEY");
    const bucket = this.requireEnv("YC_BUCKET");
    const endpoint = normalizeEndpoint(this.requireEnv("YC_ENDPOINT"));

    const { S3Client } = await import("@aws-sdk/client-s3");

    this.bucket = bucket;
    this.endpoint = endpoint;
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

  async uploadFile(file: Buffer, path: string): Promise<string> {
    await this.getClient();
    void file;
    throw new Error(`Not implemented yet: upload ${path}`);
  }

  async deleteFile(path: string): Promise<void> {
    await this.getClient();
    throw new Error(`Not implemented yet: delete ${path}`);
  }
}
