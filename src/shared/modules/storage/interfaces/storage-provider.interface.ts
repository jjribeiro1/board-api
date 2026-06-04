export const STORAGE_PROVIDER = Symbol('STORAGE_PROVIDER');

export interface StorageProvider {
  deleteFile(fileUrl: string): Promise<void>;
  generatePreSignedUrl(
    filename: string,
    contentType?: string,
    path?: string,
  ): Promise<{ uploadUrl: string; key: string; publicUrl: string }>;
}
