import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { StorageService } from './storage.service';
import { STORAGE_PROVIDER, StorageProvider } from './interfaces/storage-provider.interface';

describe('StorageService', () => {
  let service: StorageService;
  let storageProviderMock: DeepMockProxy<StorageProvider>;

  beforeEach(async () => {
    storageProviderMock = mockDeep<StorageProvider>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [StorageService, { provide: STORAGE_PROVIDER, useValue: storageProviderMock }],
    }).compile();

    service = module.get<StorageService>(StorageService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('deleteFile', () => {
    it('should delegate file deletion to the configured provider', async () => {
      storageProviderMock.deleteFile.mockResolvedValue();

      await service.deleteFile('avatars/avatar.png');

      expect(storageProviderMock.deleteFile).toHaveBeenCalledWith('avatars/avatar.png');
    });
  });

  describe('generatePreSignedUrl', () => {
    it('should delegate pre-signed URL generation to the configured provider', async () => {
      const response = {
        uploadUrl: 'https://signed.example.com/upload',
        key: 'avatars/file.png',
      };
      storageProviderMock.generatePreSignedUrl.mockResolvedValue(response);

      const result = await service.generatePreSignedUrl('avatar.png', 'image/png', 'avatars');

      expect(storageProviderMock.generatePreSignedUrl).toHaveBeenCalledWith('avatar.png', 'image/png', 'avatars');
      expect(result).toEqual(response);
    });
  });

  describe('generatePreSignedGetUrl', () => {
    it('should delegate pre-signed GET URL generation to the configured provider', async () => {
      storageProviderMock.generatePreSignedGetUrl.mockResolvedValue('https://signed.example.com/read');

      const result = await service.generatePreSignedGetUrl('avatars/file.png');

      expect(storageProviderMock.generatePreSignedGetUrl).toHaveBeenCalledWith('avatars/file.png', undefined);
      expect(result).toBe('https://signed.example.com/read');
    });

    it('should pass expiresIn to the provider', async () => {
      storageProviderMock.generatePreSignedGetUrl.mockResolvedValue('https://signed.example.com/read');

      await service.generatePreSignedGetUrl('avatars/file.png', 7200);

      expect(storageProviderMock.generatePreSignedGetUrl).toHaveBeenCalledWith('avatars/file.png', 7200);
    });
  });
});
