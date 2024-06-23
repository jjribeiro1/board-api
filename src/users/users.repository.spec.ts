import { Test, TestingModule } from '@nestjs/testing';
import { UsersRepository } from './users.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { MockContext, createMockContext } from 'src/prisma/prisma-client-mock';
import { mockCreateUserDto, mockUserEntity } from 'test/mocks/user';

describe('UsersRepository', () => {
  let usersRepository: UsersRepository;
  let mockCtx: MockContext;

  beforeEach(async () => {
    mockCtx = createMockContext();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersRepository,
        { provide: PrismaService, useValue: mockCtx.prisma },
      ],
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
});
