export interface StorageAdapter {
  uploadFile(file: Buffer, path: string): Promise<string>;
  deleteFile(path: string): Promise<void>;
  deleteFileByUrl(url: string): Promise<void>;
  presignUpload(options: {
    key: string;
    contentType: string;
    expiresInSeconds?: number;
  }): Promise<{ uploadUrl: string; publicUrl: string }>;
}
