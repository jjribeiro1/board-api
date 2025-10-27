import { Test } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import * as hashUtils from 'src/utils/hasher';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let usersService: UsersService;
  let usersRepositoryMock: DeepMockProxy<UsersRepository>;

  beforeEach(async () => {
    usersRepositoryMock = mockDeep<UsersRepository>();
    const moduleRef = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: usersRepositoryMock,
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
});
