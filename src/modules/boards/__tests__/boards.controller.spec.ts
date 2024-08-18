import { Test, TestingModule } from '@nestjs/testing';
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
});
