import { Test, TestingModule } from '@nestjs/testing';
import { BoardsService } from '../boards.service';
import { BoardsRepository } from '../boards.repository';
import { mockBoardEntity, mockBoardsRepository, mockCreateBoardDto } from 'test/mocks/boards';

describe('BoardsService', () => {
  let boardsService: BoardsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BoardsService, { provide: BoardsRepository, useValue: mockBoardsRepository }],
    }).compile();

    boardsService = module.get<BoardsService>(BoardsService);
  });

  describe('create', () => {
    it('should call BoardsRepository with correct values', async () => {
      await boardsService.create(mockCreateBoardDto, 'any-id');
      expect(mockBoardsRepository.create).toHaveBeenCalledWith({ ...mockCreateBoardDto }, 'any-id');
    });

    it('should throw if BoardsRepository throws', async () => {
      mockBoardsRepository.create.mockRejectedValueOnce(new Error('error'));

      await expect(boardsService.create(mockCreateBoardDto, 'any-id')).rejects.toThrow(new Error('error'));
    });

    it('should return the ID of the board created', async () => {
      mockBoardsRepository.create.mockResolvedValueOnce(mockBoardEntity.id);

      const result = await boardsService.create(mockCreateBoardDto, 'any-id');
      expect(result).toBe(mockBoardEntity.id);
    });
  });
});
