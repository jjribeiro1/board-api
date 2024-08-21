import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { BoardsController } from '../boards.controller';
import { BoardsService } from '../boards.service';
import { mockBoardEntity, mockBoardsService, mockCreateBoardDto } from 'test/mocks/boards';
import { mockUserEntity } from 'test/mocks/user';

jest.mock('src/shared/modules/auth/guards/jwt-auth.guard', () => ({
  JwtAuthGuard: jest.fn().mockImplementationOnce(() => ({
    canActivate: jest.fn().mockReturnValue(true),
  })),
}));

describe('BoardsController', () => {
  let controller: BoardsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BoardsController],
      providers: [BoardsService, { provide: BoardsService, useValue: mockBoardsService }],
    }).compile();

    controller = module.get<BoardsController>(BoardsController);
  });

  describe('create', () => {
    it('should call BoardsService with correct values', async () => {
      await controller.create(mockCreateBoardDto, mockUserEntity);
      expect(mockBoardsService.create).toHaveBeenCalledWith(mockCreateBoardDto, mockUserEntity.id);
    });

    it('should throw if BoardsService throws', async () => {
      mockBoardsService.create.mockRejectedValueOnce(new Error('error'));
      await expect(controller.create(mockCreateBoardDto, mockUserEntity)).rejects.toThrow(new Error('error'));
    });

    it('should return the ID of the board created', async () => {
      mockBoardsService.create.mockResolvedValueOnce(mockBoardEntity.id);
      const result = await controller.create(mockCreateBoardDto, mockUserEntity);

      expect(result).toBe(mockBoardEntity.id);
    });
  });

  describe('findOne', () => {
    it('should return board by id', async () => {
      mockBoardsService.findOne.mockResolvedValueOnce(mockBoardEntity);
      const result = await controller.findOne('any-id');
      expect(result).toEqual({ data: mockBoardEntity });
    });

    it('should throw if BoardsService throws', async () => {
      mockBoardsService.findOne.mockRejectedValueOnce(new NotFoundException());
      await expect(controller.findOne('any-id')).rejects.toThrow(new NotFoundException());
    });
  });

  describe('findPostsFromBoard', () => {
    it('should return posts from an board ', async () => {
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
          boardId: 'any-id',
          authorId: 'any-id',
          statusId: 'any-id',
        },
      ];
      mockBoardsService.findPostsFromBoard.mockResolvedValueOnce(data);

      const result = await controller.findPosts('any-id');
      expect(result).toEqual({ data });
    });

    it('should throw if BoardsService throws', async () => {
      mockBoardsService.findPostsFromBoard.mockRejectedValueOnce(new Error('error'));
      await expect(controller.findPosts('any-id')).rejects.toThrow(new Error('error'));
    });
  });
});
