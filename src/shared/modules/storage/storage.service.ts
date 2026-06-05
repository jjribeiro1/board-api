import { Inject, Injectable } from '@nestjs/common';
import { STORAGE_PROVIDER, StorageProvider } from './interfaces/storage-provider.interface';

@Injectable()
export class StorageService {
  constructor(
    @Inject(STORAGE_PROVIDER)
    private readonly storageProvider: StorageProvider,
  ) {}

  async deleteFile(key: string): Promise<void> {
    return this.storageProvider.deleteFile(key);
  }

  async generatePreSignedUrl(
    filename: string,
    contentType?: string,
    path?: string,
  ): Promise<{ uploadUrl: string; key: string }> {
    return this.storageProvider.generatePreSignedUrl(filename, contentType, path);
  }

  async generatePreSignedGetUrl(key: string, expiresIn?: number): Promise<string> {
    return this.storageProvider.generatePreSignedGetUrl(key, expiresIn);
  }
}
