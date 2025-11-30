import { Test, TestingModule } from '@nestjs/testing';
import { UsersRepository } from './users.repository';
import { PrismaService } from 'src/shared/modules/database/prisma/prisma.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaClient } from 'generated/prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { createMockUser } from 'test/factories/user-payload-factory';

describe('UsersRepository', () => {
  let repository: UsersRepository;
  let prismaServiceMock: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    prismaServiceMock = mockDeep<PrismaClient>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersRepository,
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
      ],
    }).compile();

    repository = module.get<UsersRepository>(UsersRepository);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('create', () => {
    it('should create a user and return the user id', async () => {
      const dto: CreateUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedPassword123',
      };
      const expectedUserId = 'user-id-1';
      const mockUser = createMockUser({ id: expectedUserId });

      prismaServiceMock.user.create.mockResolvedValue(mockUser);

      const result = await repository.create(dto);

      expect(prismaServiceMock.user.create).toHaveBeenCalledWith({ data: dto });
      expect(result).toBe(expectedUserId);
    });
  });

  describe('findOne', () => {
    it('should find and return a user by id with transformed organizations', async () => {
      const userId = 'user-id-1';
      const mockUser = {
        id: userId,
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedPassword123',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        organizations: [
          {
            id: 'user-org-id-1',
            name: 'Org Name 1',
            role: 'OWNER' as const,
            organization: { id: 'org-id-1' },
          },
          {
            id: 'user-org-id-2',
            name: 'Org Name 2',
            role: 'MEMBER' as const,
            organization: { id: 'org-id-2' },
          },
        ],
      };

      prismaServiceMock.user.findUnique.mockResolvedValue(mockUser);

      const result = await repository.findOne(userId);

      expect(prismaServiceMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        include: {
          organizations: {
            select: { id: true, name: true, role: true, organization: { select: { id: true } } },
          },
        },
      });

      expect(result).toMatchObject({
        id: userId,
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedPassword123',
        deletedAt: null,
        organizations: [
          { id: 'org-id-1', name: 'Org Name 1', role: 'OWNER' },
          { id: 'org-id-2', name: 'Org Name 2', role: 'MEMBER' },
        ],
      });
    });

    it('should return null if user is not found', async () => {
      const userId = 'non-existent-user-id';

      prismaServiceMock.user.findUnique.mockResolvedValue(null);

      const result = await repository.findOne(userId);

      expect(prismaServiceMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        include: {
          organizations: {
            select: { id: true, name: true, role: true, organization: { select: { id: true } } },
          },
        },
      });

      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should find and return a user by email with transformed organizations', async () => {
      const email = 'john@example.com';
      const mockUser = {
        id: 'user-id-1',
        name: 'John Doe',
        email: email,
        password: 'hashedPassword123',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        organizations: [
          {
            id: 'user-org-id-1',
            name: 'Org Name 1',
            role: 'ADMIN' as const,
            organization: { id: 'org-id-1' },
          },
        ],
      };

      prismaServiceMock.user.findUnique.mockResolvedValue(mockUser);

      const result = await repository.findByEmail(email);

      expect(prismaServiceMock.user.findUnique).toHaveBeenCalledWith({
        where: { email },
        include: {
          organizations: {
            select: { id: true, name: true, role: true, organization: { select: { id: true } } },
          },
        },
      });

      expect(result).toMatchObject({
        id: 'user-id-1',
        name: 'John Doe',
        email: email,
        password: 'hashedPassword123',
        deletedAt: null,
        organizations: [{ id: 'org-id-1', name: 'Org Name 1', role: 'ADMIN' }],
      });
    });

    it('should return null if user is not found by email', async () => {
      const email = 'nonexistent@example.com';

      prismaServiceMock.user.findUnique.mockResolvedValue(null);

      const result = await repository.findByEmail(email);

      expect(prismaServiceMock.user.findUnique).toHaveBeenCalledWith({
        where: { email },
        include: {
          organizations: {
            select: { id: true, name: true, role: true, organization: { select: { id: true } } },
          },
        },
      });

      expect(result).toBeNull();
    });
  });

  describe('organizationsFromUser', () => {
    it('should return all organizations for a user', async () => {
      const userId = 'user-id-1';
      const mockOrganizations = [
        {
          id: 'org-id-1',
          name: 'Organization 1',
          slug: 'organization-1',
          logoUrl: null,
          defaultStatusId: 'status-id-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
        {
          id: 'org-id-2',
          name: 'Organization 2',
          slug: 'organization-2',
          logoUrl: null,
          defaultStatusId: 'status-id-2',
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      ];

      prismaServiceMock.organization.findMany.mockResolvedValue(mockOrganizations);

      const result = await repository.organizationsFromUser(userId);

      expect(prismaServiceMock.organization.findMany).toHaveBeenCalledWith({
        where: {
          members: {
            some: {
              userId: userId,
            },
          },
        },
      });

      expect(result).toEqual(mockOrganizations);
    });

    it('should return an empty array if user has no organizations', async () => {
      const userId = 'user-id-1';

      prismaServiceMock.organization.findMany.mockResolvedValue([]);

      const result = await repository.organizationsFromUser(userId);

      expect(prismaServiceMock.organization.findMany).toHaveBeenCalledWith({
        where: {
          members: {
            some: {
              userId: userId,
            },
          },
        },
      });

      expect(result).toEqual([]);
    });
  });
});
