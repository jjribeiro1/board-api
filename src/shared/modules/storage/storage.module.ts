import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageService } from './storage.service';
import { STORAGE_PROVIDER } from './interfaces/storage-provider.interface';
import { S3StorageProvider } from './providers/s3.provider';

@Module({
  providers: [
    StorageService,
    {
      provide: STORAGE_PROVIDER,
      useFactory: (configService: ConfigService) => {
        return new S3StorageProvider(configService);
      },
      inject: [ConfigService],
    },
  ],
  exports: [StorageService],
})
export class StorageModule {}
