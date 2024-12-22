import { Test, TestingModule } from '@nestjs/testing';
import { PostsRepository } from '../posts.repository';
import { createMockContext, MockContext } from 'src/shared/modules/database/prisma/prisma-client-mock';
import { PrismaService } from 'src/shared/modules/database/prisma/prisma.service';
import { mockCreatePostDto, mockPostEntity } from 'test/mocks/posts';

describe('PostsRepository', () => {
  let repository: PostsRepository;
  let mockCtx: MockContext;

  beforeEach(async () => {
    mockCtx = createMockContext();

    const module: TestingModule = await Test.createTestingModule({
      providers: [PostsRepository, { provide: PrismaService, useValue: mockCtx.prisma }],
    }).compile();

    repository = module.get<PostsRepository>(PostsRepository);
  });

  describe('create', () => {
    it('should create a new post and return the ID', async () => {
      mockCtx.prisma.post.create.mockResolvedValueOnce(mockPostEntity);
      const result = await repository.create(mockCreatePostDto, 'any-id');
      expect(result).toBe('any-id');
    });
  });

  describe('findOne', () => {
    it('should return Post by id', async () => {
      mockCtx.prisma.post.findUnique.mockResolvedValueOnce(mockPostEntity);

      const result = await repository.findOne('any-id');
      expect(result).toEqual({
        authorId: 'any-id',
        boardId: 'any-id',
        description: 'any-id',
        id: 'any-id',
        title: 'any-id',
        isLocked: false,
        isPinned: false,
        isPrivate: false,
        statusId: 'any-id',
        tagsId: ['any-id'],
        createdAt: mockPostEntity.createdAt,
        updatedAt: mockPostEntity.updatedAt,
        deletedAt: mockPostEntity.deletedAt,
      });
    });

    it('should return null if Post not exists', async () => {
      mockCtx.prisma.post.findUnique.mockResolvedValueOnce(null);

      const result = await repository.findOne('any-id');
      expect(result).toBe(null);
    });
  });

  describe('findPostsFromOrganization', () => {
    it('should return posts for a given organization', async () => {
      const mockPosts = [mockPostEntity];
      mockCtx.prisma.post.findMany.mockResolvedValueOnce(mockPosts);

      const result = await repository.findPostsFromOrganization('any-org-id');
      expect(result).toEqual(
        mockPosts.map((post) => ({
          id: post.id,
          title: post.title,
          description: post.description,
          isPrivate: post.isPrivate,
          isPinned: post.isPinned,
          isLocked: post.isLocked,
          boardId: post.boardId,
          authorId: post.authorId,
          statusId: post.statusId,
          tagsId: post.tags.map((tag) => tag.tagId),
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
          deletedAt: post.deletedAt,
        })),
      );
    });
  });
});
