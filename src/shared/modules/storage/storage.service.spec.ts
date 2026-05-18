import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { StorageService } from './storage.service';
import { FileUpload, STORAGE_PROVIDER, StorageProvider } from './interfaces/storage-provider.interface';

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

  describe('uploadFile', () => {
    it('should delegate file upload to the configured provider', async () => {
      const file: FileUpload = {
        originalname: 'avatar.png',
        mimetype: 'image/png',
        buffer: Buffer.from('avatar'),
        size: 6,
      };
      storageProviderMock.uploadFile.mockResolvedValue('https://cdn.example.com/bucket/avatar.png');

      const result = await service.uploadFile(file, 'avatars');

      expect(storageProviderMock.uploadFile).toHaveBeenCalledWith(file, 'avatars');
      expect(result).toBe('https://cdn.example.com/bucket/avatar.png');
    });
  });

  describe('deleteFile', () => {
    it('should delegate file deletion to the configured provider', async () => {
      storageProviderMock.deleteFile.mockResolvedValue();

      await service.deleteFile('https://cdn.example.com/bucket/avatar.png');

      expect(storageProviderMock.deleteFile).toHaveBeenCalledWith('https://cdn.example.com/bucket/avatar.png');
    });
  });

  describe('generatePreSignedUrl', () => {
    it('should delegate pre-signed URL generation to the configured provider', async () => {
      const response = {
        uploadUrl: 'https://signed.example.com/upload',
        key: 'avatars/file.png',
        publicUrl: 'https://cdn.example.com/bucket/avatars/file.png',
      };
      storageProviderMock.generatePreSignedUrl.mockResolvedValue(response);

      const result = await service.generatePreSignedUrl('avatar.png', 'image/png', 'avatars');

      expect(storageProviderMock.generatePreSignedUrl).toHaveBeenCalledWith('avatar.png', 'image/png', 'avatars');
      expect(result).toEqual(response);
    });
  });
});
