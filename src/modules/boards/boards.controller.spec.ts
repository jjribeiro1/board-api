import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { BoardsController } from './boards.controller';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { ManageBoardDto } from './dto/manage-board.dto';
import { UserPayload } from 'src/common/types/user-payload';

describe('BoardsController', () => {
  let controller: BoardsController;
  let mockBoardsService: DeepMockProxy<BoardsService>;

  beforeEach(async () => {
    mockBoardsService = mockDeep<BoardsService>();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BoardsController],
      providers: [
        {
          provide: BoardsService,
          useValue: mockBoardsService,
        },
      ],
    }).compile();

    controller = module.get<BoardsController>(BoardsController);
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
      const user: UserPayload = {
        id: 'user-id-1',
        email: 'email@example.com',
        name: 'John Doe',
        organizations: [
          {
            id: 'org-id-1',
            name: 'Test Org',
            role: 'ADMIN',
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const expectedId = 'board-id-1';

      mockBoardsService.create.mockResolvedValue(expectedId);

      const result = await controller.create(dto, user);

      expect(mockBoardsService.create).toHaveBeenCalledWith(dto, user.id);
      expect(mockBoardsService.create).toHaveBeenCalledTimes(1);
      expect(result).toBe(expectedId);
    });

    it('should create board with minimal required fields', async () => {
      const dto: CreateBoardDto = {
        title: 'Simple Board',
        description: 'Basic board description',
        organizationId: 'org-id-2',
      };
      const user: UserPayload = {
        id: 'user-id-1',
        email: 'user@example.com',
        name: 'User One',
        organizations: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const expectedId = 'board-id-3';

      mockBoardsService.create.mockResolvedValue(expectedId);

      const result = await controller.create(dto, user);

      expect(mockBoardsService.create).toHaveBeenCalledWith(dto, user.id);
      expect(result).toBe(expectedId);
    });
  });

  describe('findOne', () => {
    it('should return a board wrapped in data property', async () => {
      const boardId = 'board-id-1';
      const mockBoard = {
        id: boardId,
        title: 'Feature Requests',
        description: 'Submit your feature ideas',
        isPrivate: false,
        isLocked: false,
        organizationId: 'org-id-1',
        authorId: 'user-id-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      mockBoardsService.findOne.mockResolvedValue(mockBoard as any);

      const result = await controller.findOne(boardId);

      expect(mockBoardsService.findOne).toHaveBeenCalledWith(boardId);
      expect(mockBoardsService.findOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ data: mockBoard });
    });
  });

  describe('findPosts', () => {
    it('should return all posts from a board wrapped in data property', async () => {
      const boardId = 'board-id-1';
      const user: UserPayload = {
        id: 'user-id-1',
        email: 'email@example.com',
        name: 'John Doe',
        organizations: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const mockPosts = [
        {
          id: 'post-id-1',
          title: 'First Post',
          description: 'Post description',
          isPinned: false,
          createdAt: new Date(),
          board: {
            id: boardId,
            title: 'Feature Requests',
          },
          status: {
            id: 'status-id-1',
            name: 'Open',
            color: '#ff0000',
          },
          tags: [],
          author: {
            id: 'user-id-1',
            name: 'John Doe',
          },
          _count: {
            comments: 3,
            votes: 10,
          },
        },
        {
          id: 'post-id-2',
          title: 'Second Post',
          description: 'Another description',
          isPinned: true,
          createdAt: new Date(),
          board: {
            id: boardId,
            title: 'Feature Requests',
          },
          status: {
            id: 'status-id-2',
            name: 'In Progress',
            color: '#00ff00',
          },
          tags: [
            {
              id: 'tag-id-1',
              name: 'Enhancement',
              color: '#0000ff',
            },
          ],
          author: {
            id: 'user-id-2',
            name: 'Jane Smith',
          },
          _count: {
            comments: 5,
            votes: 15,
          },
        },
      ];

      mockBoardsService.findPostsFromBoard.mockResolvedValue(mockPosts as any);

      const result = await controller.findPosts(boardId, user);

      expect(mockBoardsService.findPostsFromBoard).toHaveBeenCalledWith(boardId, user.id);
      expect(mockBoardsService.findPostsFromBoard).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ data: mockPosts });
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
      const updatedBoard = {
        id: boardId,
        title: dto.title,
        description: dto.description,
        isPrivate: dto.isPrivate,
        isLocked: dto.isLocked,
        organizationId: 'org-id-1',
        authorId: 'user-id-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      mockBoardsService.manageBoard.mockResolvedValue(updatedBoard as any);

      const result = await controller.manageBoard(boardId, dto);

      expect(mockBoardsService.manageBoard).toHaveBeenCalledWith(boardId, dto);
      expect(mockBoardsService.manageBoard).toHaveBeenCalledTimes(1);
      expect(result).toEqual(updatedBoard);
    });

    it('should allow partial updates', async () => {
      const boardId = 'board-id-2';
      const dto: ManageBoardDto = {
        isLocked: true,
      };
      const updatedBoard = {
        id: boardId,
        title: 'Original Title',
        description: 'Original description',
        isPrivate: false,
        isLocked: true,
        organizationId: 'org-id-1',
        authorId: 'user-id-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      mockBoardsService.manageBoard.mockResolvedValue(updatedBoard as any);

      const result = await controller.manageBoard(boardId, dto);

      expect(mockBoardsService.manageBoard).toHaveBeenCalledWith(boardId, dto);
      expect(result).toEqual(updatedBoard);
    });
  });

  describe('remove', () => {
    it('should delete a board successfully', async () => {
      const boardId = 'board-id-1';

      mockBoardsService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(boardId);

      expect(mockBoardsService.remove).toHaveBeenCalledWith(boardId);
      expect(mockBoardsService.remove).toHaveBeenCalledTimes(1);
      expect(result).toBeUndefined();
    });
  });
});
