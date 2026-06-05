import { InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { S3StorageProvider } from './s3.provider';

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({
    send: jest.fn(),
    config: {
      endpoint: jest.fn(),
    },
  })),
  PutObjectCommand: jest.fn().mockImplementation((input) => ({ input })),
  DeleteObjectCommand: jest.fn().mockImplementation((input) => ({ input })),
  GetObjectCommand: jest.fn().mockImplementation((input) => ({ input })),
}));

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn(),
}));

jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

describe('S3StorageProvider', () => {
  let provider: S3StorageProvider;
  let configServiceMock: { getOrThrow: jest.Mock };
  let mockSend: jest.Mock;
  let mockEndpoint: jest.Mock;

  const s3ClientMock = S3Client as jest.MockedClass<typeof S3Client>;
  const putObjectCommandMock = PutObjectCommand as unknown as jest.Mock;
  const deleteObjectCommandMock = DeleteObjectCommand as unknown as jest.Mock;
  const getObjectCommandMock = GetObjectCommand as unknown as jest.Mock;
  const getSignedUrlMock = getSignedUrl as jest.MockedFunction<typeof getSignedUrl>;
  const uuidMock = uuidv4 as unknown as jest.Mock;

  beforeEach(() => {
    configServiceMock = {
      getOrThrow: jest.fn((key: string) => {
        const values: Record<string, string> = {
          AWS_S3_BUCKET_NAME: 'board-bucket',
          AWS_ENDPOINT_URL: 'https://s3.example.com',
          AWS_DEFAULT_REGION: 'us-east-1',
          AWS_ACCESS_KEY_ID: 'access-key',
          AWS_SECRET_ACCESS_KEY: 'secret-key',
        };

        return values[key];
      }),
    };

    provider = new S3StorageProvider(configServiceMock as unknown as ConfigService);
    mockSend = (provider as unknown as { s3Client: { send: jest.Mock } }).s3Client.send;
    mockEndpoint = (provider as unknown as { s3Client: { config: { endpoint: jest.Mock } } }).s3Client.config.endpoint;

    mockSend.mockReset();
    mockEndpoint.mockReset();
    s3ClientMock.mockClear();
    putObjectCommandMock.mockClear();
    deleteObjectCommandMock.mockClear();
    getObjectCommandMock.mockClear();
    getSignedUrlMock.mockReset();
    uuidMock.mockReset();
  });

  describe('deleteFile', () => {
    it('should delete a file using the provided key', async () => {
      mockSend.mockResolvedValue({});

      await provider.deleteFile('avatars/uuid-123.png');

      expect(deleteObjectCommandMock).toHaveBeenCalledWith({
        Bucket: 'board-bucket',
        Key: 'avatars/uuid-123.png',
      });
    });

    it('should wrap deletion failures with an internal server error', async () => {
      mockSend.mockRejectedValue(new Error('permission denied'));

      await expect(provider.deleteFile('avatars/avatar.png')).rejects.toThrow(
        new InternalServerErrorException('Falha ao deletar arquivo do S3: permission denied'),
      );
    });
  });

  describe('generatePreSignedUrl', () => {
    it('should generate a signed upload URL and return the key', async () => {
      uuidMock.mockReturnValue('uuid-456');
      getSignedUrlMock.mockResolvedValue('https://signed.example.com/upload');

      const result = await provider.generatePreSignedUrl('avatar.png', 'image/png', '/avatars/');

      expect(putObjectCommandMock).toHaveBeenCalledWith({
        Bucket: 'board-bucket',
        Key: 'avatars/uuid-456.png',
        ContentType: 'image/png',
      });
      expect(getSignedUrlMock).toHaveBeenCalledWith(
        expect.objectContaining({
          send: mockSend,
        }),
        {
          input: {
            Bucket: 'board-bucket',
            Key: 'avatars/uuid-456.png',
            ContentType: 'image/png',
          },
        },
        { expiresIn: 3600 },
      );
      expect(result).toEqual({
        uploadUrl: 'https://signed.example.com/upload',
        key: 'avatars/uuid-456.png',
      });
    });

    it('should omit content type when it is not provided', async () => {
      uuidMock.mockReturnValue('uuid-789');
      getSignedUrlMock.mockResolvedValue('https://signed.example.com/upload');

      await provider.generatePreSignedUrl('avatar.png');

      expect(putObjectCommandMock).toHaveBeenCalledWith({
        Bucket: 'board-bucket',
        Key: 'uuid-789.png',
      });
    });

    it('should wrap signed URL generation failures with an internal server error', async () => {
      uuidMock.mockReturnValue('uuid-456');
      getSignedUrlMock.mockRejectedValue(new Error('signing failed'));

      await expect(provider.generatePreSignedUrl('avatar.png')).rejects.toThrow(
        new InternalServerErrorException('Falha ao gerar URL pré-assinada do S3: signing failed'),
      );
    });
  });

  describe('generatePreSignedGetUrl', () => {
    it('should generate a signed GET URL for the given key', async () => {
      getSignedUrlMock.mockResolvedValue('https://signed.example.com/read');

      const result = await provider.generatePreSignedGetUrl('avatars/uuid-123.png');

      expect(getObjectCommandMock).toHaveBeenCalledWith({
        Bucket: 'board-bucket',
        Key: 'avatars/uuid-123.png',
      });
      expect(getSignedUrlMock).toHaveBeenCalledWith(
        expect.objectContaining({ send: mockSend }),
        {
          input: {
            Bucket: 'board-bucket',
            Key: 'avatars/uuid-123.png',
          },
        },
        { expiresIn: 3600 },
      );
      expect(result).toBe('https://signed.example.com/read');
    });

    it('should accept a custom expiresIn value', async () => {
      getSignedUrlMock.mockResolvedValue('https://signed.example.com/read');

      await provider.generatePreSignedGetUrl('avatars/uuid-123.png', 7200);

      expect(getSignedUrlMock).toHaveBeenCalledWith(expect.anything(), expect.anything(), { expiresIn: 7200 });
    });

    it('should wrap failures with an internal server error', async () => {
      getSignedUrlMock.mockRejectedValue(new Error('get signing failed'));

      await expect(provider.generatePreSignedGetUrl('avatars/uuid-123.png')).rejects.toThrow(
        new InternalServerErrorException('Falha ao gerar URL pré-assinada de leitura do S3: get signing failed'),
      );
    });
  });
});
