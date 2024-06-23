import { Test, TestingModule } from '@nestjs/testing';
import { UsersRepository } from './users.repository';
import {
  MockContext,
  createMockContext,
} from 'src/prisma/prisma-client-mock';
import { PrismaService } from 'src/prisma/prisma.service';

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
      const input = {
        name: 'any-name',
        email: 'any-email',
        password: 'any-password',
      };
      const output = {
        ...input,
        id: 'any-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockCtx.prisma.user.create.mockResolvedValueOnce(output);

      const result = await usersRepository.create(input);
      expect(result).toEqual(output.id);
    });
  });
});
