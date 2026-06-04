import { Inject, Injectable } from '@nestjs/common';
import { STORAGE_PROVIDER, StorageProvider } from './interfaces/storage-provider.interface';

@Injectable()
export class StorageService {
  constructor(
    @Inject(STORAGE_PROVIDER)
    private readonly storageProvider: StorageProvider,
  ) {}

  async deleteFile(fileUrl: string): Promise<void> {
    return this.storageProvider.deleteFile(fileUrl);
  }

  async generatePreSignedUrl(
    filename: string,
    contentType?: string,
    path?: string,
  ): Promise<{ uploadUrl: string; key: string; publicUrl: string }> {
    return this.storageProvider.generatePreSignedUrl(filename, contentType, path);
  }
}
