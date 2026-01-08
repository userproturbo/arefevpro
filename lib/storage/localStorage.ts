import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { StorageAdapter, UploadResult } from "./types";

export class LocalStorageAdapter implements StorageAdapter {
  private uploadDir = path.join(process.cwd(), "public/uploads");

  async uploadFile(file: File): Promise<UploadResult> {
    await fs.mkdir(this.uploadDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = path.extname(file.name);
    const filename = `${crypto.randomUUID()}${ext}`;
    const fullPath = path.join(this.uploadDir, filename);

    await fs.writeFile(fullPath, buffer);

    return {
      storageKey: filename,
      url: `/uploads/${filename}`,
      size: buffer.length,
      mimeType: file.type || "application/octet-stream",
    };
  }
}
