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

  describe('findOne', () => {
    it('should return board by id', async () => {
      mockCtx.prisma.board.findUnique.mockResolvedValueOnce(mockBoardEntity);
      const result = await repository.findOne('any-id');
      expect(result).toEqual(mockBoardEntity);
    });

    it('should return null if board not exists', async () => {
      mockCtx.prisma.board.findUnique.mockResolvedValueOnce(null);

      const result = await repository.findOne('any-id');
      expect(result).toBe(null);
    });
  });

  describe('findPostsFromBoard', () => {
    it('should return an array of posts', async () => {
      const data = [
        {
          id: 'any-id',
          title: 'any-title',
          description: 'any-description',
          isPrivate: false,
          isPinned: false,
          isLocked: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          boardId: 'any-id',
          authorId: 'any-id',
          statusId: 'any-id',
        },
      ];
      mockCtx.prisma.post.findMany.mockResolvedValueOnce(data);
      const result = await repository.findPostsFromBoard('any-id');
      expect(result).toEqual(data);
    });
  });
});
