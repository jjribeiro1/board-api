import { Test } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import * as hashUtils from 'src/utils/hasher';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { StorageService } from 'src/shared/modules/storage/storage.service';
import { RequestAvatarUploadUrlDto } from './dto/request-avatar-upload-url.dto';
import { ConfirmAvatarUploadDto } from './dto/confirm-avatar-upload.dto';

describe('UsersService', () => {
  let usersService: UsersService;
  let usersRepositoryMock: DeepMockProxy<UsersRepository>;
  let storageServiceMock: DeepMockProxy<StorageService>;

  beforeEach(async () => {
    usersRepositoryMock = mockDeep<UsersRepository>();
    storageServiceMock = mockDeep<StorageService>();
    const moduleRef = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: usersRepositoryMock,
        },
        {
          provide: StorageService,
          useValue: storageServiceMock,
        },
      ],
    }).compile();

    usersService = moduleRef.get<UsersService>(UsersService);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('create', () => {
    const dto: CreateUserDto = {
      name: 'John Doe',
      email: 'email@example.com',
      password: 'password123',
    };

    it('should create a new user with hashed password and return the ID', async () => {
      const expectedId = 'user-id-1';
      const hashedPassword = 'hashedPassword123';

      usersRepositoryMock.findByEmail.mockResolvedValue(null);

      const hashSpy = jest.spyOn(hashUtils, 'hashData').mockResolvedValue(hashedPassword);

      usersRepositoryMock.create.mockResolvedValue(expectedId);

      const result = await usersService.create(dto);

      expect(result).toBe(expectedId);
      expect(usersRepositoryMock.findByEmail).toHaveBeenCalledWith(dto.email);
      expect(usersRepositoryMock.findByEmail).toHaveBeenCalledTimes(1);
      expect(hashSpy).toHaveBeenCalledWith(dto.password, 10);
      expect(hashSpy).toHaveBeenCalledTimes(1);
      expect(usersRepositoryMock.create).toHaveBeenCalledWith({
        email: dto.email,
        name: dto.name,
        password: hashedPassword,
      });
      expect(usersRepositoryMock.create).toHaveBeenCalledTimes(1);
    });

    it('should throw ConflictException if email is already in use', async () => {
      const errorMessage = `Email ${dto.email} já foi registrado`;
      usersRepositoryMock.findByEmail.mockResolvedValueOnce({} as any);

      await expect(usersService.create(dto)).rejects.toThrow(new ConflictException(errorMessage));
    });
  });

  describe('findOne', () => {
    const userId = 'user-id-1';
    const mockUser = {
      id: userId,
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashedPassword',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      avatarUrl: null,
      organizations: [
        {
          id: 'org-id-1',
          name: 'Organization 1',
          role: 'ADMIN' as const,
        },
      ],
    };

    it('should return a user when found', async () => {
      usersRepositoryMock.findOne.mockResolvedValue(mockUser);

      const result = await usersService.findOne(userId);

      expect(result).toEqual(mockUser);
      expect(usersRepositoryMock.findOne).toHaveBeenCalledWith(userId);
      expect(usersRepositoryMock.findOne).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when user is not found', async () => {
      usersRepositoryMock.findOne.mockResolvedValue(null);

      const errorMessage = `usuário com id: ${userId} não encontrado`;

      await expect(usersService.findOne(userId)).rejects.toThrow(new NotFoundException(errorMessage));
      expect(usersRepositoryMock.findOne).toHaveBeenCalledWith(userId);
      expect(usersRepositoryMock.findOne).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOneWithResolvedAvatar', () => {
    const userId = 'user-id-1';

    it('should return user with resolved avatar URL when user has an avatar', async () => {
      const mockUser = {
        id: userId,
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        avatarUrl: 'avatars/uuid-123.png',
        organizations: [],
      };
      usersRepositoryMock.findOne.mockResolvedValue(mockUser);
      storageServiceMock.generatePreSignedGetUrl.mockResolvedValue('https://signed.example.com/read');

      const result = await usersService.findOneWithResolvedAvatar(userId);

      expect(result.avatarUrl).toBe('https://signed.example.com/read');
      expect(storageServiceMock.generatePreSignedGetUrl).toHaveBeenCalledWith('avatars/uuid-123.png');
    });

    it('should return user with null avatar when user has no avatar', async () => {
      const mockUser = {
        id: userId,
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        avatarUrl: null,
        organizations: [],
      };
      usersRepositoryMock.findOne.mockResolvedValue(mockUser);

      const result = await usersService.findOneWithResolvedAvatar(userId);

      expect(result.avatarUrl).toBeNull();
      expect(storageServiceMock.generatePreSignedGetUrl).not.toHaveBeenCalled();
    });
  });

  describe('organizationsFromUser', () => {
    const userId = 'user-id-1';
    const mockUser = {
      id: userId,
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashedPassword',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      avatarUrl: null,
      organizations: [
        {
          id: 'org-id-1',
          name: 'Organization 1',
          role: 'ADMIN' as const,
        },
      ],
    };
    const mockOrganizations = [
      {
        id: 'org-id-1',
        name: 'Organization 1',
        slug: 'org-1',
        defaultStatusId: '',
        logoUrl: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
      {
        id: 'org-id-2',
        name: 'Organization 2',
        slug: 'org-2',
        defaultStatusId: '',
        logoUrl: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
    ];

    it('should return organizations when user exists', async () => {
      usersRepositoryMock.findOne.mockResolvedValue(mockUser);
      usersRepositoryMock.organizationsFromUser.mockResolvedValue(mockOrganizations);

      const result = await usersService.organizationsFromUser(userId);

      expect(result).toEqual(mockOrganizations);
      expect(usersRepositoryMock.findOne).toHaveBeenCalledWith(userId);
      expect(usersRepositoryMock.findOne).toHaveBeenCalledTimes(1);
      expect(usersRepositoryMock.organizationsFromUser).toHaveBeenCalledWith(userId);
      expect(usersRepositoryMock.organizationsFromUser).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      usersRepositoryMock.findOne.mockResolvedValue(null);

      const errorMessage = `usuário com id: ${userId} não encontrado`;

      await expect(usersService.organizationsFromUser(userId)).rejects.toThrow(new NotFoundException(errorMessage));
      expect(usersRepositoryMock.findOne).toHaveBeenCalledWith(userId);
      expect(usersRepositoryMock.findOne).toHaveBeenCalledTimes(1);
      expect(usersRepositoryMock.organizationsFromUser).not.toHaveBeenCalled();
    });
  });

  describe('requestAvatarUploadUrl', () => {
    const userId = 'user-id-1';
    const mockUser = {
      id: userId,
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashedPassword',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      avatarUrl: null,
      organizations: [],
    };
    const dto: RequestAvatarUploadUrlDto = { filename: 'avatar.png', contentType: 'image/png' };

    it('should return uploadUrl and key when user exists', async () => {
      const preSignedResult = {
        uploadUrl: 'https://s3.example.com/upload?signed=...',
        key: 'avatars/uuid.png',
      };
      usersRepositoryMock.findOne.mockResolvedValue(mockUser);
      storageServiceMock.generatePreSignedUrl.mockResolvedValue(preSignedResult);

      const result = await usersService.requestAvatarUploadUrl(userId, dto);

      expect(result).toEqual(preSignedResult);
      expect(storageServiceMock.generatePreSignedUrl).toHaveBeenCalledWith(dto.filename, dto.contentType, 'avatars');
    });

    it('should throw NotFoundException when user does not exist', async () => {
      usersRepositoryMock.findOne.mockResolvedValue(null);

      await expect(usersService.requestAvatarUploadUrl(userId, dto)).rejects.toThrow(NotFoundException);
      expect(storageServiceMock.generatePreSignedUrl).not.toHaveBeenCalled();
    });
  });

  describe('confirmAvatarUpload', () => {
    const userId = 'user-id-1';
    const dto: ConfirmAvatarUploadDto = { key: 'avatars/uuid.png' };

    const mockUserWithoutAvatar = {
      id: userId,
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashedPassword',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      avatarUrl: null,
      organizations: [],
    };

    const mockUserWithAvatar = {
      ...mockUserWithoutAvatar,
      avatarUrl: 'avatars/old-uuid.png',
    };

    it('should store the key and return a resolved pre-signed GET URL when user has no previous avatar', async () => {
      usersRepositoryMock.findOne.mockResolvedValue(mockUserWithoutAvatar);
      usersRepositoryMock.updateAvatar.mockResolvedValue({ ...mockUserWithoutAvatar, avatarUrl: dto.key } as any);
      storageServiceMock.generatePreSignedGetUrl.mockResolvedValue('https://signed.example.com/read');

      const result = await usersService.confirmAvatarUpload(userId, dto);

      expect(result).toEqual({ avatarUrl: 'https://signed.example.com/read' });
      expect(storageServiceMock.deleteFile).not.toHaveBeenCalled();
      expect(usersRepositoryMock.updateAvatar).toHaveBeenCalledWith(userId, dto.key);
      expect(storageServiceMock.generatePreSignedGetUrl).toHaveBeenCalledWith(dto.key);
    });

    it('should delete old avatar key before updating when user already has an avatar', async () => {
      usersRepositoryMock.findOne.mockResolvedValue(mockUserWithAvatar);
      storageServiceMock.deleteFile.mockResolvedValue(undefined);
      usersRepositoryMock.updateAvatar.mockResolvedValue({ ...mockUserWithAvatar, avatarUrl: dto.key } as any);
      storageServiceMock.generatePreSignedGetUrl.mockResolvedValue('https://signed.example.com/read');

      const result = await usersService.confirmAvatarUpload(userId, dto);

      expect(result).toEqual({ avatarUrl: 'https://signed.example.com/read' });
      expect(storageServiceMock.deleteFile).toHaveBeenCalledWith(mockUserWithAvatar.avatarUrl);
      expect(usersRepositoryMock.updateAvatar).toHaveBeenCalledWith(userId, dto.key);
    });

    it('should still update avatar even if deleting old file fails', async () => {
      usersRepositoryMock.findOne.mockResolvedValue(mockUserWithAvatar);
      storageServiceMock.deleteFile.mockRejectedValue(new Error('S3 error'));
      usersRepositoryMock.updateAvatar.mockResolvedValue({ ...mockUserWithAvatar, avatarUrl: dto.key } as any);
      storageServiceMock.generatePreSignedGetUrl.mockResolvedValue('https://signed.example.com/read');

      const result = await usersService.confirmAvatarUpload(userId, dto);

      expect(result).toEqual({ avatarUrl: 'https://signed.example.com/read' });
      expect(usersRepositoryMock.updateAvatar).toHaveBeenCalledWith(userId, dto.key);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      usersRepositoryMock.findOne.mockResolvedValue(null);

      await expect(usersService.confirmAvatarUpload(userId, dto)).rejects.toThrow(NotFoundException);
      expect(usersRepositoryMock.updateAvatar).not.toHaveBeenCalled();
    });
  });

  describe('resolveAvatarUrl', () => {
    it('should return null when avatarKey is null', async () => {
      const result = await usersService.resolveAvatarUrl(null);
      expect(result).toBeNull();
      expect(storageServiceMock.generatePreSignedGetUrl).not.toHaveBeenCalled();
    });

    it('should return a pre-signed GET URL when avatarKey is provided', async () => {
      storageServiceMock.generatePreSignedGetUrl.mockResolvedValue('https://signed.example.com/read');

      const result = await usersService.resolveAvatarUrl('avatars/uuid.png');

      expect(result).toBe('https://signed.example.com/read');
      expect(storageServiceMock.generatePreSignedGetUrl).toHaveBeenCalledWith('avatars/uuid.png');
    });
  });
});
