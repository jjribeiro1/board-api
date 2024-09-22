import { Test, TestingModule } from '@nestjs/testing';
import { UsersRepository } from '../users.repository';
import { PrismaService } from 'src/shared/modules/database/prisma/prisma.service';
import { MockContext, createMockContext } from 'src/shared/modules/database/prisma/prisma-client-mock';
import { mockCreateUserDto, mockUserEntity } from 'test/mocks/user';

describe('UsersRepository', () => {
  let usersRepository: UsersRepository;
  let mockCtx: MockContext;

  beforeEach(async () => {
    mockCtx = createMockContext();

    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersRepository, { provide: PrismaService, useValue: mockCtx.prisma }],
    }).compile();

    usersRepository = module.get<UsersRepository>(UsersRepository);
  });

  describe('create', () => {
    it('should create a new user ', async () => {
      mockCtx.prisma.user.create.mockResolvedValueOnce(mockUserEntity);

      const result = await usersRepository.create(mockCreateUserDto);
      expect(result).toEqual(mockUserEntity.id);
    });
  });

  describe('findOne', () => {
    it('should return user by id', async () => {
      mockCtx.prisma.user.findUnique.mockResolvedValueOnce(mockUserEntity);

      const result = await usersRepository.findOne('any-id');
      expect(result).toEqual(mockUserEntity);
    });

    it('should return null if user not exists', async () => {
      mockCtx.prisma.user.findUnique.mockResolvedValueOnce(null);

      const result = await usersRepository.findOne('any-id');
      expect(result).toBe(null);
    });
  });

  describe('findByEmail', () => {
    it('should return user by email', async () => {
      mockCtx.prisma.user.findUnique.mockResolvedValueOnce(mockUserEntity);

      const result = await usersRepository.findOne('any-email');
      expect(result).toEqual(mockUserEntity);
    });

    it('should return null if user not exists', async () => {
      mockCtx.prisma.user.findUnique.mockResolvedValueOnce(null);

      const result = await usersRepository.findOne('any-email');
      expect(result).toBe(null);
    });
  });

  describe('organizationsFromUser', () => {
    it('should return organizations from an user', async () => {
      const data = [
        { id: 'any-id', name: 'any-name', logoUrl: 'any-url', createdAt: new Date(), updatedAt: new Date() },
      ];
      mockCtx.prisma.organization.findMany.mockResolvedValueOnce(data);

      const result = await usersRepository.organizationFromUser('any-id');
      expect(result).toEqual(data);
    });
  });
});
