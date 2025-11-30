import { Test, TestingModule } from '@nestjs/testing';
import { PostsRepository } from './posts.repository';
import { PrismaService } from 'src/shared/modules/database/prisma/prisma.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaClient } from 'generated/prisma/client';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

describe('PostsRepository', () => {
  let repository: PostsRepository;
  let prismaServiceMock: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    prismaServiceMock = mockDeep<PrismaClient>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsRepository,
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
      ],
    }).compile();

    repository = module.get<PostsRepository>(PostsRepository);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('create', () => {
    it('should create a post with tags and return the post id', async () => {
      const userId = 'user-id-1';
      const dto: CreatePostDto = {
        title: 'New Feature Request',
        description: 'Description of the feature',
        boardId: 'board-id-1',
        statusId: 'status-id-1',
        isPrivate: false,
        isPinned: false,
        isLocked: false,
        tagIds: ['tag-id-1', 'tag-id-2'],
      };
      const expectedPostId = 'post-id-1';
      const mockPost = {
        id: expectedPostId,
        title: dto.title,
        description: dto.description!,
        boardId: dto.boardId,
        statusId: dto.statusId!,
        authorId: userId,
        isPrivate: false,
        isPinned: false,
        isLocked: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      prismaServiceMock.post.create.mockResolvedValue(mockPost);

      const result = await repository.create(dto, userId);

      expect(prismaServiceMock.post.create).toHaveBeenCalledWith({
        data: {
          authorId: userId,
          boardId: dto.boardId,
          description: dto.description,
          isLocked: dto.isLocked,
          isPinned: dto.isPinned,
          isPrivate: dto.isPrivate,
          statusId: dto.statusId,
          title: dto.title,
          tags: {
            create: dto.tagIds!.map((tagId) => ({
              tagId,
            })),
          },
        },
      });

      expect(result).toBe(expectedPostId);
    });

    it('should create a post without tags and return the post id', async () => {
      const userId = 'user-id-1';
      const dto: CreatePostDto = {
        title: 'New Feature Request',
        description: 'Description of the feature',
        boardId: 'board-id-1',
        statusId: 'status-id-1',
        isPrivate: false,
        isPinned: false,
        isLocked: false,
      };
      const expectedPostId = 'post-id-1';
      const mockPost = {
        id: expectedPostId,
        title: dto.title,
        description: dto.description!,
        boardId: dto.boardId,
        statusId: dto.statusId!,
        authorId: userId,
        isPrivate: false,
        isPinned: false,
        isLocked: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      prismaServiceMock.post.create.mockResolvedValue(mockPost);

      const result = await repository.create(dto, userId);

      expect(prismaServiceMock.post.create).toHaveBeenCalledWith({
        data: {
          authorId: userId,
          boardId: dto.boardId,
          description: dto.description,
          isLocked: dto.isLocked,
          isPinned: dto.isPinned,
          isPrivate: dto.isPrivate,
          statusId: dto.statusId,
          title: dto.title,
          tags: undefined,
        },
      });

      expect(result).toBe(expectedPostId);
    });
  });

  describe('findOne', () => {
    it('should find and return a post with transformed data', async () => {
      const postId = 'post-id-1';
      const mockPost = {
        id: postId,
        title: 'Feature Request',
        description: 'Description',
        isPrivate: false,
        isPinned: false,
        isLocked: false,
        boardId: 'board-id-1',
        authorId: 'user-id-1',
        statusId: 'status-id-1',
        deletedAt: null,
        board: {
          organizationId: 'org-id-1',
        },
        author: { id: 'user-id-1', name: 'John Doe' },
        status: { id: 'status-id-1', name: 'Open', color: '#FF5733' },
        tags: [
          { tag: { id: 'tag-id-1', name: 'Feature', color: '#00FF00' } },
          { tag: { id: 'tag-id-2', name: 'High Priority', color: '#FF0000' } },
        ],
        _count: {
          votes: 5,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaServiceMock.post.findUnique.mockResolvedValue(mockPost);

      const result = await repository.findOne(postId);

      expect(prismaServiceMock.post.findUnique).toHaveBeenCalledWith({
        where: {
          id: postId,
          deletedAt: null,
        },
        select: expect.objectContaining({
          id: true,
          title: true,
          description: true,
          isPrivate: true,
          isPinned: true,
          isLocked: true,
          boardId: true,
        }),
      });

      expect(result).toMatchObject({
        id: postId,
        title: 'Feature Request',
        description: 'Description',
        tags: [
          { id: 'tag-id-1', name: 'Feature', color: '#00FF00' },
          { id: 'tag-id-2', name: 'High Priority', color: '#FF0000' },
        ],
        organizationId: 'org-id-1',
        votesCount: 5,
      });
    });

    it('should return null if post is not found', async () => {
      const postId = 'non-existent-post-id';

      prismaServiceMock.post.findUnique.mockResolvedValue(null);

      const result = await repository.findOne(postId);

      expect(prismaServiceMock.post.findUnique).toHaveBeenCalledWith({
        where: {
          id: postId,
          deletedAt: null,
        },
        select: expect.any(Object),
      });

      expect(result).toBeNull();
    });
  });

  describe('findCommentsFromPost', () => {
    it('should find and return comments with transformed data', async () => {
      const postId = 'post-id-1';
      const mockComments = [
        {
          id: 'comment-id-1',
          content: 'Great idea!',
          postId: postId,
          authorId: 'user-id-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          author: { id: 'user-id-1', name: 'John Doe' },
          post: {
            board: {
              organizationId: 'org-id-1',
            },
          },
        },
        {
          id: 'comment-id-2',
          content: 'I agree',
          postId: postId,
          authorId: 'user-id-2',
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          author: { id: 'user-id-2', name: 'Jane Smith' },
          post: {
            board: {
              organizationId: 'org-id-1',
            },
          },
        },
      ];

      prismaServiceMock.comment.findMany.mockResolvedValue(mockComments);

      const result = await repository.findCommentsFromPost(postId);

      expect(prismaServiceMock.comment.findMany).toHaveBeenCalledWith({
        where: {
          deletedAt: null,
          post: {
            id: postId,
          },
        },
        select: expect.any(Object),
      });

      expect(result).toEqual([
        {
          id: 'comment-id-1',
          content: 'Great idea!',
          author: { id: 'user-id-1', name: 'John Doe' },
          postId: postId,
          organizationId: 'org-id-1',
          createdAt: mockComments[0].createdAt,
          updatedAt: mockComments[0].updatedAt,
          deletedAt: null,
        },
        {
          id: 'comment-id-2',
          content: 'I agree',
          author: { id: 'user-id-2', name: 'Jane Smith' },
          postId: postId,
          organizationId: 'org-id-1',
          createdAt: mockComments[1].createdAt,
          updatedAt: mockComments[1].updatedAt,
          deletedAt: null,
        },
      ]);
    });

    it('should return an empty array if post has no comments', async () => {
      const postId = 'post-id-1';

      prismaServiceMock.comment.findMany.mockResolvedValue([]);

      const result = await repository.findCommentsFromPost(postId);

      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update a post and return the updated post', async () => {
      const postId = 'post-id-1';
      const dto: UpdatePostDto = {
        title: 'Updated Title',
        description: 'Updated Description',
      };
      const mockUpdatedPost = {
        id: postId,
        title: 'Updated Title',
        description: 'Updated Description',
        boardId: 'board-id-1',
        statusId: 'status-id-2',
        authorId: 'user-id-1',
        isPrivate: false,
        isPinned: false,
        isLocked: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        status: {
          id: 'status-id-2',
          name: 'In Progress',
        },
      };

      prismaServiceMock.post.update.mockResolvedValue(mockUpdatedPost);

      const result = await repository.update(postId, dto);

      expect(prismaServiceMock.post.update).toHaveBeenCalledWith({
        where: { id: postId },
        data: {
          ...dto,
        },
        include: {
          status: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      expect(result).toEqual(mockUpdatedPost);
    });
  });

  describe('delete', () => {
    it('should soft delete a post by setting deletedAt', async () => {
      const postId = 'post-id-1';
      const mockDeletedPost = {
        id: postId,
        title: 'Feature Request',
        description: 'Description',
        boardId: 'board-id-1',
        statusId: 'status-id-1',
        authorId: 'user-id-1',
        isPrivate: false,
        isPinned: false,
        isLocked: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: new Date(),
      };

      prismaServiceMock.post.update.mockResolvedValue(mockDeletedPost);

      await repository.delete(postId);

      expect(prismaServiceMock.post.update).toHaveBeenCalledWith({
        where: { id: postId },
        data: { deletedAt: expect.any(Date) },
      });
    });
  });

  describe('findAuthorAndOrgIdFromPost', () => {
    it('should find and return author id and organization id from post', async () => {
      const postId = 'post-id-1';
      const mockPost = {
        id: postId,
        title: 'Post',
        description: 'Description',
        isPrivate: false,
        isLocked: false,
        isPinned: false,
        boardId: 'board-id-1',
        statusId: 'status-id-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        authorId: 'user-id-1',
        board: {
          organizationId: 'org-id-1',
        },
      };

      prismaServiceMock.post.findUnique.mockResolvedValue(mockPost);

      const result = await repository.findAuthorAndOrgIdFromPost(postId);

      expect(prismaServiceMock.post.findUnique).toHaveBeenCalledWith({
        where: { id: postId, deletedAt: null },
        select: {
          authorId: true,
          board: {
            select: {
              organizationId: true,
            },
          },
        },
      });

      expect(result).toEqual({
        authorId: 'user-id-1',
        organizationId: 'org-id-1',
      });
    });

    it('should return null if post is not found', async () => {
      const postId = 'non-existent-post-id';

      prismaServiceMock.post.findUnique.mockResolvedValue(null);

      const result = await repository.findAuthorAndOrgIdFromPost(postId);

      expect(result).toBeNull();
    });
  });

  describe('updateTags', () => {
    it('should delete existing tags and create new ones', async () => {
      const postId = 'post-id-1';
      const tagIds = ['tag-id-3', 'tag-id-4'];

      prismaServiceMock.$transaction.mockResolvedValue([{ count: 2 }, { count: 2 }]);

      await repository.updateTags(postId, tagIds);

      expect(prismaServiceMock.$transaction).toHaveBeenCalledWith([
        prismaServiceMock.postTag.deleteMany({
          where: { postId },
        }),
        prismaServiceMock.postTag.createMany({
          data: tagIds.map((tagId) => ({
            postId,
            tagId,
          })),
        }),
      ]);
    });

    it('should only delete existing tags when tagIds is empty', async () => {
      const postId = 'post-id-1';
      const tagIds: string[] = [];

      prismaServiceMock.$transaction.mockResolvedValue([{ count: 2 }]);

      await repository.updateTags(postId, tagIds);

      expect(prismaServiceMock.$transaction).toHaveBeenCalledWith([
        prismaServiceMock.postTag.deleteMany({
          where: { postId },
        }),
      ]);
    });
  });
});
