import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { UserPayload } from 'src/common/types/user-payload';

describe('CommentsController', () => {
  let controller: CommentsController;
  let mockCommentsService: DeepMockProxy<CommentsService>;

  beforeEach(async () => {
    mockCommentsService = mockDeep<CommentsService>();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [
        {
          provide: CommentsService,
          useValue: mockCommentsService,
        },
      ],
    }).compile();

    controller = module.get<CommentsController>(CommentsController);
  });

  describe('create', () => {
    it('should create a new comment and return its ID', async () => {
      const dto: CreateCommentDto = {
        content: 'This is a great suggestion!',
        postId: 'post-id-1',
      };
      const user: UserPayload = {
        id: 'user-id-1',
        email: 'email@example.com',
        name: 'John Doe',
        organizations: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const expectedId = 'comment-id-1';

      mockCommentsService.create.mockResolvedValue(expectedId);

      const result = await controller.create(dto, user);

      expect(mockCommentsService.create).toHaveBeenCalledWith(dto, user.id);
      expect(mockCommentsService.create).toHaveBeenCalledTimes(1);
      expect(result).toBe(expectedId);
    });
  });

  describe('update', () => {
    it('should update a comment successfully', async () => {
      const commentId = 'comment-id-1';
      const dto: UpdateCommentDto = {
        content: 'Updated comment content',
      };

      mockCommentsService.update.mockResolvedValue(undefined);

      const result = await controller.update(commentId, dto);

      expect(mockCommentsService.update).toHaveBeenCalledWith(commentId, dto);
      expect(mockCommentsService.update).toHaveBeenCalledTimes(1);
      expect(result).toBeUndefined();
    });

    it('should update comment with different content', async () => {
      const commentId = 'comment-id-2';
      const dto: UpdateCommentDto = {
        content: 'This is the corrected information',
      };

      mockCommentsService.update.mockResolvedValue(undefined);

      const result = await controller.update(commentId, dto);

      expect(mockCommentsService.update).toHaveBeenCalledWith(commentId, dto);
      expect(result).toBeUndefined();
    });
  });

  describe('remove', () => {
    it('should delete a comment successfully', async () => {
      const commentId = 'comment-id-1';

      mockCommentsService.delete.mockResolvedValue(undefined);

      const result = await controller.remove(commentId);

      expect(mockCommentsService.delete).toHaveBeenCalledWith(commentId);
      expect(mockCommentsService.delete).toHaveBeenCalledTimes(1);
      expect(result).toBeUndefined();
    });
  });
});
