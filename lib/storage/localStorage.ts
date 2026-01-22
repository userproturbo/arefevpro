import fs from "fs/promises";
import path from "path";
import { StorageAdapter } from "./types";

export class LocalStorageAdapter implements StorageAdapter {
  private uploadDir: string;

  constructor() {
    this.uploadDir = path.join(process.cwd(), "public", "uploads");
  }

  async uploadFile(file: Buffer, filePath: string): Promise<string> {
    const normalizedPath = this.normalizePath(filePath);
    const destination = path.join(this.uploadDir, normalizedPath);

    await fs.mkdir(path.dirname(destination), { recursive: true });
    await fs.writeFile(destination, file);

    return `/uploads/${normalizedPath.replace(/\\/g, "/")}`;
  }

  async deleteFile(filePath: string): Promise<void> {
    const normalizedPath = this.normalizePath(filePath);
    const destination = path.join(this.uploadDir, normalizedPath);
    await fs.unlink(destination);
  }

  async presignUpload(
    _options: {
      key: string;
      contentType: string;
      expiresInSeconds?: number;
    }
  ): Promise<{ uploadUrl: string; publicUrl: string }> {
    throw new Error("Presigned uploads are not supported for local storage.");
  }

  private normalizePath(filePath: string): string {
    const trimmed = filePath.replace(/^[/\\]+/, "");
    return trimmed.startsWith("uploads/") ? trimmed.slice("uploads/".length) : trimmed;
  }
}
