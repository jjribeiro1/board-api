import { Test } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

describe('UsersController', () => {
  let usersController: UsersController;
  let usersServiceMock: DeepMockProxy<UsersService>;

  beforeEach(async () => {
    usersServiceMock = mockDeep<UsersService>();
    const moduleRef = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
      ],
    }).compile();

    usersController = moduleRef.get<UsersController>(UsersController);
  });

  describe('create', () => {
    it('should create a new user and return the ID', async () => {
      const expectedId = 'user-id-1';
      const dto: CreateUserDto = {
        name: 'John Doe',
        email: 'email@example.com',
        password: 'password123',
      };
      usersServiceMock.create.mockResolvedValue(expectedId);

      const result = await usersController.create(dto);

      expect(result).toBe(expectedId);
      expect(usersServiceMock.create).toHaveBeenCalledWith(dto);
      expect(usersServiceMock.create).toHaveBeenCalledTimes(1);
    });

    it('should throw ConflictException when email already exists', async () => {
      const dto: CreateUserDto = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'John Doe',
      };
      const errorMsg = `Email ${dto.email} já foi registrado`;
      usersServiceMock.create.mockRejectedValue(new ConflictException(errorMsg));

      await expect(usersController.create(dto)).rejects.toThrow(new ConflictException(errorMsg));
      expect(usersServiceMock.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findOne', () => {
    it('should return user data without password', async () => {
      const userId = 'user-id';
      const userMock = {
        id: userId,
        name: 'John Doe',
        email: 'email@example.com',
        password: 'password-hash',
        organizations: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      usersServiceMock.findOne.mockResolvedValue(userMock);

      const result = await usersController.findOne(userId);

      expect(result).toEqual({ data: { ...userMock, password: undefined } });
      expect(usersServiceMock.findOne).toHaveBeenCalledWith(userId);
      expect(usersServiceMock.findOne).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      const userId = 'non-existent-id';
      const errorMsg = `usuário com id: ${userId} não encontrado`;
      usersServiceMock.findOne.mockRejectedValue(new NotFoundException(errorMsg));

      await expect(usersController.findOne(userId)).rejects.toThrow(new NotFoundException(errorMsg));
      expect(usersServiceMock.findOne).toHaveBeenCalledWith(userId);
    });
  });

  describe('findOrgFromUser', () => {
    it('should return organizations for a given user', async () => {
      const userId = 'user-id';
      const organizationsMock = [
        {
          id: 'org-id-1',
          name: 'Organization 1',
          slug: 'organization-1',
          defaultStatusId: 'default-status-id-1',
          logoUrl: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
        {
          id: 'org-id-2',
          name: 'Organization 2',
          slug: 'organization-2',
          defaultStatusId: 'default-status-id-2',
          logoUrl: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      ];
      usersServiceMock.organizationsFromUser.mockResolvedValue(organizationsMock);

      const result = await usersController.findOrgFromUser(userId);

      expect(result).toEqual({ data: organizationsMock });
      expect(usersServiceMock.organizationsFromUser).toHaveBeenCalledWith(userId);
      expect(usersServiceMock.organizationsFromUser).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when user has no organizations', async () => {
      const userId = 'user-id';
      usersServiceMock.organizationsFromUser.mockResolvedValue([]);

      const result = await usersController.findOrgFromUser(userId);

      expect(result).toEqual({ data: [] });
      expect(result.data).toHaveLength(0);
      expect(usersServiceMock.organizationsFromUser).toHaveBeenCalledWith(userId);
    });
  });
});
