import { Comment } from 'src/modules/comments/entities/comment.entity';

export const mockCreateCommentDto = {
  content: 'any-content',
  postId: 'any-id',
};

export const mockCommentEntity = new Comment('any-id', 'any-content', 'any-id', 'any-id', new Date(), new Date(), null);
