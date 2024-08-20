import { CreatePostDto } from 'src/modules/posts/dto/create-post.dto';
import { Post } from 'src/modules/posts/entities/post.entity';

export const mockCreatePostDto: CreatePostDto = {
  boardId: 'any-id',
  description: 'any-id',
  isLocked: false,
  isPinned: false,
  isPrivate: false,
  statusId: 'any-id',
  title: 'any-id',
};

export const mockPostEntity: Post = {
  ...mockCreatePostDto,
  id: 'any-id',
  authorId: 'any-id',
  isLocked: false,
  isPinned: false,
  isPrivate: false,
  tagsId: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockPostsRepository = {
  create: jest.fn(),
};
