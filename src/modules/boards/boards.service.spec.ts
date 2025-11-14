import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { NotFoundException } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { BoardsRepository } from './boards.repository';
import { CreateBoardDto } from './dto/create-board.dto';
import { ManageBoardDto } from './dto/manage-board.dto';

describe('BoardsService', () => {
  let service: BoardsService;
  let boardsRepositoryMock: DeepMockProxy<BoardsRepository>;

  beforeEach(async () => {
    boardsRepositoryMock = mockDeep<BoardsRepository>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoardsService,
        {
          provide: BoardsRepository,
          useValue: boardsRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<BoardsService>(BoardsService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new board and return its ID', async () => {
      const dto: CreateBoardDto = {
        title: 'Feature Requests',
        description: 'Submit your feature ideas here',
        isPrivate: false,
        isLocked: false,
        organizationId: 'org-id-1',
      };
      const userId = 'user-id-1';
      const expectedId = 'board-id-1';

      boardsRepositoryMock.create.mockResolvedValue(expectedId);

      const result = await service.create(dto, userId);

      expect(boardsRepositoryMock.create).toHaveBeenCalledWith(dto, userId);
      expect(boardsRepositoryMock.create).toHaveBeenCalledTimes(1);
      expect(result).toBe(expectedId);
    });

    it('should create board with minimal required fields', async () => {
      const dto: CreateBoardDto = {
        title: 'Simple Board',
        description: 'Basic description',
        organizationId: 'org-id-2',
      };
      const userId = 'user-id-3';
      const expectedId = 'board-id-3';

      boardsRepositoryMock.create.mockResolvedValue(expectedId);

      const result = await service.create(dto, userId);

      expect(boardsRepositoryMock.create).toHaveBeenCalledWith(dto, userId);
      expect(result).toBe(expectedId);
    });
  });

  describe('findOne', () => {
    it('should return a board when found', async () => {
      const boardId = 'board-id-1';
      const mockBoard = {
        id: boardId,
        title: 'Feature Requests',
        description: 'Submit your ideas',
        isPrivate: false,
        isLocked: false,
        organizationId: 'org-id-1',
        authorId: 'user-id-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      boardsRepositoryMock.findOne.mockResolvedValue(mockBoard);

      const result = await service.findOne(boardId);

      expect(boardsRepositoryMock.findOne).toHaveBeenCalledWith(boardId);
      expect(boardsRepositoryMock.findOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockBoard);
    });

    it('should throw NotFoundException when board is not found', async () => {
      const boardId = 'non-existent-id';

      boardsRepositoryMock.findOne.mockResolvedValue(null);

      const errorMessage = `board com id: ${boardId} não encontrado`;

      await expect(service.findOne(boardId)).rejects.toThrow(new NotFoundException(errorMessage));

      expect(boardsRepositoryMock.findOne).toHaveBeenCalledWith(boardId);
      expect(boardsRepositoryMock.findOne).toHaveBeenCalledTimes(1);
    });
  });

  describe('findPostsFromBoard', () => {
    it('should return posts from a board', async () => {
      const boardId = 'board-id-1';
      const userId = 'user-id-1';
      const mockBoard = {
        id: boardId,
        title: 'Feature Requests',
        description: 'Submit your ideas',
        isPrivate: false,
        isLocked: false,
        organizationId: 'org-id-1',
        authorId: 'user-id-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      const mockPosts = [
        {
          id: 'post-id-1',
          title: 'First Post',
          description: 'Post description',
          isPinned: false,
          createdAt: new Date(),
          board: { id: boardId, title: 'Feature Requests' },
          status: { id: 'status-id-1', name: 'Open', color: '#ff0000' },
          tags: [],
          author: { id: userId, name: 'John Doe' },
          _count: { comments: 2, votes: 5 },
        },
      ];

      boardsRepositoryMock.findOne.mockResolvedValue(mockBoard);
      boardsRepositoryMock.findPostsFromBoard.mockResolvedValue(mockPosts as any);

      const result = await service.findPostsFromBoard(boardId, userId);

      expect(boardsRepositoryMock.findOne).toHaveBeenCalledWith(boardId);
      expect(boardsRepositoryMock.findPostsFromBoard).toHaveBeenCalledWith(boardId, userId);
      expect(boardsRepositoryMock.findPostsFromBoard).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockPosts);
    });

    it('should throw NotFoundException when board does not exist', async () => {
      const boardId = 'non-existent-id';
      const userId = 'user-id-1';

      boardsRepositoryMock.findOne.mockResolvedValue(null);

      const errorMessage = `board com id: ${boardId} não encontrado`;

      await expect(service.findPostsFromBoard(boardId, userId)).rejects.toThrow(new NotFoundException(errorMessage));

      expect(boardsRepositoryMock.findOne).toHaveBeenCalledWith(boardId);
      expect(boardsRepositoryMock.findPostsFromBoard).not.toHaveBeenCalled();
    });
  });

  describe('manageBoard', () => {
    it('should update board settings successfully', async () => {
      const boardId = 'board-id-1';
      const dto: ManageBoardDto = {
        title: 'Updated Title',
        description: 'Updated description',
        isPrivate: true,
        isLocked: false,
      };
      const mockBoard = {
        id: boardId,
        title: 'Original Title',
        description: 'Original description',
        isPrivate: false,
        isLocked: false,
        organizationId: 'org-id-1',
        authorId: 'user-id-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      const updatedBoard = {
        ...mockBoard,
        ...dto,
      };

      boardsRepositoryMock.findOne.mockResolvedValue(mockBoard);
      boardsRepositoryMock.update.mockResolvedValue(updatedBoard);

      const result = await service.manageBoard(boardId, dto);

      expect(boardsRepositoryMock.findOne).toHaveBeenCalledWith(boardId);
      expect(boardsRepositoryMock.update).toHaveBeenCalledWith(boardId, dto);
      expect(boardsRepositoryMock.update).toHaveBeenCalledTimes(1);
      expect(result).toEqual(updatedBoard);
    });

    it('should throw NotFoundException when board does not exist', async () => {
      const boardId = 'non-existent-id';
      const dto: ManageBoardDto = {
        title: 'New Title',
      };

      boardsRepositoryMock.findOne.mockResolvedValue(null);

      const errorMessage = `board com id: ${boardId} não encontrado`;

      await expect(service.manageBoard(boardId, dto)).rejects.toThrow(new NotFoundException(errorMessage));

      expect(boardsRepositoryMock.findOne).toHaveBeenCalledWith(boardId);
      expect(boardsRepositoryMock.update).not.toHaveBeenCalled();
    });

    it('should allow partial updates', async () => {
      const boardId = 'board-id-2';
      const dto: ManageBoardDto = {
        isLocked: true,
      };
      const mockBoard = {
        id: boardId,
        title: 'Board Title',
        description: 'Board description',
        isPrivate: false,
        isLocked: false,
        organizationId: 'org-id-1',
        authorId: 'user-id-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      const updatedBoard = {
        ...mockBoard,
        isLocked: true,
      };

      boardsRepositoryMock.findOne.mockResolvedValue(mockBoard);
      boardsRepositoryMock.update.mockResolvedValue(updatedBoard);

      const result = await service.manageBoard(boardId, dto);

      expect(boardsRepositoryMock.update).toHaveBeenCalledWith(boardId, dto);
      expect(result).toEqual(updatedBoard);
    });
  });

  describe('remove', () => {
    it('should delete a board successfully', async () => {
      const boardId = 'board-id-1';
      const mockBoard = {
        id: boardId,
        title: 'Board to Delete',
        description: 'This board will be deleted',
        isPrivate: false,
        isLocked: false,
        organizationId: 'org-id-1',
        authorId: 'user-id-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      boardsRepositoryMock.findOne.mockResolvedValue(mockBoard);
      boardsRepositoryMock.delete.mockResolvedValue(undefined);

      await service.remove(boardId);

      expect(boardsRepositoryMock.findOne).toHaveBeenCalledWith(boardId);
      expect(boardsRepositoryMock.findOne).toHaveBeenCalledTimes(1);
      expect(boardsRepositoryMock.delete).toHaveBeenCalledWith(boardId);
      expect(boardsRepositoryMock.delete).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when board does not exist', async () => {
      const boardId = 'non-existent-id';

      boardsRepositoryMock.findOne.mockResolvedValue(null);

      const errorMessage = `board com id: ${boardId} não encontrado`;

      await expect(service.remove(boardId)).rejects.toThrow(new NotFoundException(errorMessage));

      expect(boardsRepositoryMock.findOne).toHaveBeenCalledWith(boardId);
      expect(boardsRepositoryMock.delete).not.toHaveBeenCalled();
    });
  });
});
