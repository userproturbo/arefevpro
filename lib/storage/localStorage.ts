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

  private normalizePath(filePath: string): string {
    const trimmed = filePath.replace(/^[/\\]+/, "");
    return trimmed.startsWith("uploads/") ? trimmed.slice("uploads/".length) : trimmed;
  }
}
