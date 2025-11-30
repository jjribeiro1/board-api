import { Test, TestingModule } from '@nestjs/testing';
import { BoardsRepository } from './boards.repository';
import { PrismaService } from 'src/shared/modules/database/prisma/prisma.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaClient } from 'generated/prisma/client';
import { CreateBoardDto } from './dto/create-board.dto';
import { ManageBoardDto } from './dto/manage-board.dto';

describe('BoardsRepository', () => {
  let repository: BoardsRepository;
  let prismaServiceMock: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    prismaServiceMock = mockDeep<PrismaClient>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoardsRepository,
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
      ],
    }).compile();

    repository = module.get<BoardsRepository>(BoardsRepository);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('create', () => {
    it('should create a board and return the board id', async () => {
      const userId = 'user-id-1';
      const dto: CreateBoardDto = {
        title: 'Feature Requests',
        description: 'Board for feature requests',
        organizationId: 'org-id-1',
        isLocked: false,
        isPrivate: false,
      };
      const expectedBoardId = 'board-id-1';
      const mockBoard = {
        id: expectedBoardId,
        title: dto.title,
        description: dto.description,
        organizationId: dto.organizationId,
        authorId: userId,
        isLocked: false,
        isPrivate: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      prismaServiceMock.board.create.mockResolvedValue(mockBoard);

      const result = await repository.create(dto, userId);

      expect(prismaServiceMock.board.create).toHaveBeenCalledWith({
        data: {
          authorId: userId,
          description: dto.description,
          organizationId: dto.organizationId,
          title: dto.title,
          isLocked: dto.isLocked,
          isPrivate: dto.isPrivate,
        },
      });

      expect(result).toBe(expectedBoardId);
    });
  });

  describe('findOne', () => {
    it('should find and return a board', async () => {
      const boardId = 'board-id-1';
      const mockBoard = {
        id: boardId,
        title: 'Feature Requests',
        description: 'Board for feature requests',
        organizationId: 'org-id-1',
        authorId: 'user-id-1',
        isLocked: false,
        isPrivate: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      prismaServiceMock.board.findUnique.mockResolvedValue(mockBoard);

      const result = await repository.findOne(boardId);

      expect(prismaServiceMock.board.findUnique).toHaveBeenCalledWith({
        where: {
          id: boardId,
          deletedAt: null,
        },
      });

      expect(result).toEqual(mockBoard);
    });

    it('should return null if board is not found', async () => {
      const boardId = 'non-existent-board-id';

      prismaServiceMock.board.findUnique.mockResolvedValue(null);

      const result = await repository.findOne(boardId);

      expect(prismaServiceMock.board.findUnique).toHaveBeenCalledWith({
        where: {
          id: boardId,
          deletedAt: null,
        },
      });

      expect(result).toBeNull();
    });
  });

  describe('findPostsFromBoard', () => {
    it('should find and return posts from a board with userHasVoted flag', async () => {
      const boardId = 'board-id-1';
      const userId = 'user-id-1';
      const mockPosts = [
        {
          id: 'post-id-1',
          title: 'Post 1',
          isLocked: false,
          isPinned: true,
          isPrivate: false,
          description: 'Description 1',
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          authorId: 'user-id-1',
          boardId: boardId,
          statusId: 'status-id-1',
          author: {
            id: 'user-id-1',
            name: 'John Doe',
          },
          status: {
            id: 'status-id-1',
            name: 'Open',
            color: '#00FF00',
          },
          _count: {
            comments: 5,
            votes: 10,
          },
          votes: [{ id: 'vote-id-1', userId, postId: 'post-id-1', createdAt: new Date() }],
        },
        {
          id: 'post-id-2',
          title: 'Post 2',
          isLocked: false,
          isPinned: false,
          isPrivate: false,
          description: 'Description 2',
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          authorId: 'user-id-2',
          boardId: boardId,
          statusId: 'status-id-2',
          author: {
            id: 'user-id-2',
            name: 'Jane Doe',
          },
          status: {
            id: 'status-id-2',
            name: 'In Progress',
            color: '#FFFF00',
          },
          _count: {
            comments: 3,
            votes: 7,
          },
          votes: [],
        },
      ];

      prismaServiceMock.post.findMany.mockResolvedValue(mockPosts);

      const result = await repository.findPostsFromBoard(boardId, userId);

      expect(prismaServiceMock.post.findMany).toHaveBeenCalledWith({
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        where: {
          boardId,
          deletedAt: null,
        },
        select: {
          id: true,
          title: true,
          isLocked: true,
          isPinned: true,
          isPrivate: true,
          description: true,
          createdAt: true,
          author: {
            select: {
              id: true,
              name: true,
            },
          },
          status: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
          _count: {
            select: {
              comments: {
                where: {
                  deletedAt: null,
                },
              },
              votes: true,
            },
          },
          votes: {
            where: {
              userId,
            },
          },
        },
      });

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id: 'post-id-1',
        title: 'Post 1',
        userHasVoted: true,
      });
      expect(result[1]).toMatchObject({
        id: 'post-id-2',
        title: 'Post 2',
        userHasVoted: false,
      });
    });

    it('should return empty array if no posts are found', async () => {
      const boardId = 'board-id-1';
      const userId = 'user-id-1';

      prismaServiceMock.post.findMany.mockResolvedValue([]);

      const result = await repository.findPostsFromBoard(boardId, userId);

      expect(prismaServiceMock.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            boardId,
            deletedAt: null,
          },
        }),
      );

      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update a board', async () => {
      const boardId = 'board-id-1';
      const dto: ManageBoardDto = {
        title: 'Updated Board Title',
        description: 'Updated description',
        isLocked: true,
        isPrivate: true,
      };
      const mockUpdatedBoard = {
        id: boardId,
        title: 'Updated Board Title',
        description: 'Updated description',
        organizationId: 'org-id-1',
        authorId: 'user-id-1',
        isLocked: true,
        isPrivate: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      prismaServiceMock.board.update.mockResolvedValue(mockUpdatedBoard);

      const result = await repository.update(boardId, dto);

      expect(prismaServiceMock.board.update).toHaveBeenCalledWith({
        where: { id: boardId },
        data: { ...dto },
      });

      expect(result).toEqual(mockUpdatedBoard);
    });
  });

  describe('delete', () => {
    it('should soft delete a board by setting deletedAt', async () => {
      const boardId = 'board-id-1';
      const mockDeletedBoard = {
        id: boardId,
        title: 'Feature Requests',
        description: 'Board for feature requests',
        organizationId: 'org-id-1',
        authorId: 'user-id-1',
        isLocked: false,
        isPrivate: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: new Date(),
      };

      prismaServiceMock.board.update.mockResolvedValue(mockDeletedBoard);

      await repository.delete(boardId);

      expect(prismaServiceMock.board.update).toHaveBeenCalledWith({
        where: { id: boardId },
        data: { deletedAt: expect.any(Date) },
      });
    });
  });
});
