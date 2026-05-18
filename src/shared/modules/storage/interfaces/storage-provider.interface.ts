export interface FileUpload {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

export const STORAGE_PROVIDER = Symbol('STORAGE_PROVIDER');

export interface StorageProvider {
  uploadFile(file: FileUpload, path?: string): Promise<string>;
  deleteFile(fileUrl: string): Promise<void>;
  generatePreSignedUrl(
    filename: string,
    contentType?: string,
    path?: string,
  ): Promise<{ uploadUrl: string; key: string; publicUrl: string }>;
}
