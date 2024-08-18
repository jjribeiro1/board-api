import { Test, TestingModule } from '@nestjs/testing';
import { BoardsRepository } from '../boards.repository';
import { PrismaService } from 'src/shared/modules/database/prisma/prisma.service';
import { MockContext, createMockContext } from 'src/shared/modules/database/prisma/prisma-client-mock';
import { mockCreateBoardDto, mockBoardEntity } from 'test/mocks/boards';

describe('BoardsRepository', () => {
  let repository: BoardsRepository;
  let mockCtx: MockContext;

  beforeEach(async () => {
    mockCtx = createMockContext();

    const module: TestingModule = await Test.createTestingModule({
      providers: [BoardsRepository, { provide: PrismaService, useValue: mockCtx.prisma }],
    }).compile();

    repository = module.get<BoardsRepository>(BoardsRepository);
  });

  describe('create', () => {
    it('should create a new board and return the ID', async () => {
      mockCtx.prisma.board.create.mockResolvedValueOnce(mockBoardEntity);
      const result = await repository.create(mockCreateBoardDto, 'any-id');
      expect(result).toBe('any-id');
    });
  });
});
