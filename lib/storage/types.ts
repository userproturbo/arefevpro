export interface StorageAdapter {
  uploadFile(file: Buffer, path: string): Promise<string>;
  deleteFile(path: string): Promise<void>;
}
