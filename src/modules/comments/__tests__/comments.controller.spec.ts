import { Test, TestingModule } from '@nestjs/testing';
import { CommentsController } from '../comments.controller';
import { CommentsService } from '../comments.service';
import { mockCommentService, mockCreateCommentDto, mockCommentEntity } from 'test/mocks/comments';
import { mockUserEntity } from 'test/mocks/user';

jest.mock('src/shared/modules/auth/guards/jwt-auth.guard', () => ({
  JwtAuthGuard: jest.fn().mockImplementationOnce(() => ({
    canActivate: jest.fn().mockReturnValue(true),
  })),
}));

describe('CommentsController', () => {
  let controller: CommentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [CommentsService, { provide: CommentsService, useValue: mockCommentService }],
    }).compile();

    controller = module.get<CommentsController>(CommentsController);
  });

  describe('create', () => {
    it('should call CommentsService with correct values', async () => {
      await controller.create(mockCreateCommentDto, mockUserEntity);
      expect(mockCommentService.create).toHaveBeenCalledWith(mockCreateCommentDto, mockUserEntity.id);
    });

    it('should throw if CommentsService throws', async () => {
      mockCommentService.create.mockRejectedValueOnce(new Error('error'));
      await expect(controller.create(mockCreateCommentDto, mockUserEntity)).rejects.toThrow(new Error('error'));
    });

    it('should return the ID of the Comment created', async () => {
      mockCommentService.create.mockResolvedValueOnce(mockCommentEntity.id);
      const result = await controller.create(mockCreateCommentDto, mockUserEntity);

      expect(result).toBe(mockCommentEntity.id);
    });
  });
});
