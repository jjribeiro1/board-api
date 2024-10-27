import { Test, TestingModule } from '@nestjs/testing';
import { mockCreateCommentDto, mockCommentEntity, mockCommentRepository } from 'test/mocks/comments';
import { CommentsService } from '../comments.service';
import { CommentsRepository } from '../comments.repository';

describe('CommentsService', () => {
  let commentsService: CommentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommentsService, { provide: CommentsRepository, useValue: mockCommentRepository }],
    }).compile();

    commentsService = module.get<CommentsService>(CommentsService);
  });

  describe('create', () => {
    it('should call CommentsRepository with correct values', async () => {
      await commentsService.create(mockCreateCommentDto, 'any-id');
      expect(mockCommentRepository.create).toHaveBeenCalledWith({ ...mockCreateCommentDto }, 'any-id');
    });

    it('should throw if CommentsRepository throws', async () => {
      mockCommentRepository.create.mockRejectedValueOnce(new Error('error'));
      await expect(commentsService.create(mockCreateCommentDto, 'any-id')).rejects.toThrow(new Error('error'));
    });

    it('should return the ID of the Comment created', async () => {
      mockCommentRepository.create.mockResolvedValueOnce(mockCommentEntity.id);
      const result = await commentsService.create(mockCommentEntity, 'any-id');
      expect(result).toBe(mockCommentEntity.id);
    });
  });
});
