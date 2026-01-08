export interface UploadResult {
  storageKey: string;
  url: string;
  size: number;
  mimeType: string;
}

export interface StorageAdapter {
  uploadFile(file: File): Promise<UploadResult>;
}
