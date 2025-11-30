import { Test, TestingModule } from '@nestjs/testing';
import { CommentsRepository } from './comments.repository';
import { PrismaService } from 'src/shared/modules/database/prisma/prisma.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaClient } from 'generated/prisma/client';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

describe('CommentsRepository', () => {
  let repository: CommentsRepository;
  let prismaServiceMock: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    prismaServiceMock = mockDeep<PrismaClient>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsRepository,
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
      ],
    }).compile();

    repository = module.get<CommentsRepository>(CommentsRepository);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('create', () => {
    it('should create a comment and return the comment id', async () => {
      const userId = 'user-id-1';
      const dto: CreateCommentDto = {
        content: 'This is a comment',
        postId: 'post-id-1',
      };
      const expectedCommentId = 'comment-id-1';
      const mockComment = {
        id: expectedCommentId,
        content: dto.content,
        postId: dto.postId,
        authorId: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      prismaServiceMock.comment.create.mockResolvedValue(mockComment);

      const result = await repository.create(dto, userId);

      expect(prismaServiceMock.comment.create).toHaveBeenCalledWith({
        data: { content: dto.content, postId: dto.postId, authorId: userId },
      });

      expect(result).toBe(expectedCommentId);
    });
  });

  describe('findOne', () => {
    it('should find and return a comment with author data', async () => {
      const commentId = 'comment-id-1';
      const mockComment = {
        id: commentId,
        content: 'This is a comment',
        postId: 'post-id-1',
        authorId: 'user-id-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        author: {
          id: 'user-id-1',
          name: 'John Doe',
        },
      };

      prismaServiceMock.comment.findUnique.mockResolvedValue(mockComment);

      const result = await repository.findOne(commentId);

      expect(prismaServiceMock.comment.findUnique).toHaveBeenCalledWith({
        where: { id: commentId, deletedAt: null },
        select: {
          id: true,
          content: true,
          postId: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
          author: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      expect(result).toEqual(mockComment);
    });

    it('should return null if comment is not found', async () => {
      const commentId = 'non-existent-comment-id';

      prismaServiceMock.comment.findUnique.mockResolvedValue(null);

      const result = await repository.findOne(commentId);

      expect(prismaServiceMock.comment.findUnique).toHaveBeenCalledWith({
        where: { id: commentId, deletedAt: null },
        select: expect.any(Object),
      });

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a comment content', async () => {
      const commentId = 'comment-id-1';
      const dto: UpdateCommentDto = {
        content: 'Updated comment content',
      };
      const mockUpdatedComment = {
        id: commentId,
        content: dto.content,
        postId: 'post-id-1',
        authorId: 'user-id-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      prismaServiceMock.comment.update.mockResolvedValue(mockUpdatedComment);

      await repository.update(commentId, dto);

      expect(prismaServiceMock.comment.update).toHaveBeenCalledWith({
        where: { id: commentId },
        data: { content: dto.content },
      });
    });
  });

  describe('delete', () => {
    it('should soft delete a comment by setting deletedAt', async () => {
      const commentId = 'comment-id-1';
      const mockDeletedComment = {
        id: commentId,
        content: 'This is a comment',
        postId: 'post-id-1',
        authorId: 'user-id-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: new Date(),
      };

      prismaServiceMock.comment.update.mockResolvedValue(mockDeletedComment);

      await repository.delete(commentId);

      expect(prismaServiceMock.comment.update).toHaveBeenCalledWith({
        where: { id: commentId },
        data: { deletedAt: expect.any(Date) },
      });
    });
  });

  describe('findAuthorAndOrgIdFromComment', () => {
    it('should find and return author id and organization id from comment', async () => {
      const commentId = 'comment-id-1';
      const mockComment = {
        id: commentId,
        content: 'Comment',
        postId: 'post-id-1',
        authorId: 'user-id-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        post: {
          board: {
            organizationId: 'org-id-1',
          },
        },
      };

      prismaServiceMock.comment.findUnique.mockResolvedValue(mockComment);

      const result = await repository.findAuthorAndOrgIdFromComment(commentId);

      expect(prismaServiceMock.comment.findUnique).toHaveBeenCalledWith({
        where: { id: commentId, deletedAt: null },
        select: {
          authorId: true,
          post: {
            select: {
              board: {
                select: {
                  organizationId: true,
                },
              },
            },
          },
        },
      });

      expect(result).toEqual({
        authorId: 'user-id-1',
        organizationId: 'org-id-1',
      });
    });

    it('should return null if comment is not found', async () => {
      const commentId = 'non-existent-comment-id';

      prismaServiceMock.comment.findUnique.mockResolvedValue(null);

      const result = await repository.findAuthorAndOrgIdFromComment(commentId);

      expect(prismaServiceMock.comment.findUnique).toHaveBeenCalledWith({
        where: { id: commentId, deletedAt: null },
        select: expect.any(Object),
      });

      expect(result).toBeNull();
    });
  });
});
