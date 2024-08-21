import { CreatePostDto } from 'src/modules/posts/dto/create-post.dto';

export const mockCreatePostDto: CreatePostDto = {
  boardId: 'any-id',
  description: 'any-id',
  isLocked: false,
  isPinned: false,
  isPrivate: false,
  statusId: 'any-id',
  title: 'any-id',
};

export const mockPostEntity = {
  ...mockCreatePostDto,
  id: 'any-id',
  authorId: 'any-id',
  isLocked: false,
  isPinned: false,
  isPrivate: false,
  tags: [{ tagId: 'any-id' }],
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockPostsRepository = {
  create: jest.fn(),
  findOne: jest.fn(),
};

export const mockPostsService = {
  create: jest.fn(),
  findOne: jest.fn(),
};
