import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsRepository } from './comments.repository';
import { PostsService } from '../posts/posts.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

describe('CommentsService', () => {
  let service: CommentsService;
  let commentsRepositoryMock: DeepMockProxy<CommentsRepository>;
  let postsServiceMock: DeepMockProxy<PostsService>;

  beforeEach(async () => {
    commentsRepositoryMock = mockDeep<CommentsRepository>();
    postsServiceMock = mockDeep<PostsService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide: CommentsRepository,
          useValue: commentsRepositoryMock,
        },
        {
          provide: PostsService,
          useValue: postsServiceMock,
        },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    const dto: CreateCommentDto = {
      content: 'This is a great suggestion!',
      postId: 'post-id-1',
    };
    const userId = 'user-id-1';
    const expectedId = 'comment-id-1';

    it('should create a comment when post is not locked', async () => {
      const post = {
        id: 'post-id-1',
        title: 'Test Post',
        description: 'Test Description',
        isLocked: false,
        isPinned: false,
        isPrivate: false,
        boardId: 'board-id-1',
        organizationId: 'org-id-1',
        author: { id: 'user-id-2', name: 'Jane Doe' },
        status: { id: 'status-id-1', name: 'Open', color: '#007BFF' },
        tags: [],
        _count: { comments: 0, votes: 0 },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      postsServiceMock.findOne.mockResolvedValue(post as any);
      commentsRepositoryMock.create.mockResolvedValue(expectedId);

      const result = await service.create(dto, userId);

      expect(postsServiceMock.findOne).toHaveBeenCalledWith(dto.postId);
      expect(postsServiceMock.findOne).toHaveBeenCalledTimes(1);
      expect(commentsRepositoryMock.create).toHaveBeenCalledWith(dto, userId);
      expect(commentsRepositoryMock.create).toHaveBeenCalledTimes(1);
      expect(result).toBe(expectedId);
    });

    it('should throw ForbiddenException when post is locked', async () => {
      const lockedPost = {
        id: 'post-id-1',
        title: 'Test Post',
        description: 'Test Description',
        isLocked: true,
        isPinned: false,
        isPrivate: false,
        boardId: 'board-id-1',
        organizationId: 'org-id-1',
        author: { id: 'user-id-2', name: 'Jane Doe' },
        status: { id: 'status-id-1', name: 'Open', color: '#007BFF' },
        tags: [],
        _count: { comments: 0, votes: 0 },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      postsServiceMock.findOne.mockResolvedValue(lockedPost as any);

      const errorMessage = 'Não é possível comentar em um post bloqueado';

      await expect(service.create(dto, userId)).rejects.toThrow(new ForbiddenException(errorMessage));

      expect(postsServiceMock.findOne).toHaveBeenCalledWith(dto.postId);
      expect(commentsRepositoryMock.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when post does not exist', async () => {
      const errorMessage = `post com id: ${dto.postId} não encontrado`;

      postsServiceMock.findOne.mockRejectedValue(new NotFoundException(errorMessage));

      await expect(service.create(dto, userId)).rejects.toThrow(new NotFoundException(errorMessage));

      expect(postsServiceMock.findOne).toHaveBeenCalledWith(dto.postId);
      expect(commentsRepositoryMock.create).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a comment when found', async () => {
      const commentId = 'comment-id-1';
      const mockComment = {
        id: commentId,
        content: 'This is a great suggestion!',
        postId: 'post-id-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        author: {
          id: 'user-id-1',
          name: 'John Doe',
        },
      };

      commentsRepositoryMock.findOne.mockResolvedValue(mockComment);

      const result = await service.findOne(commentId);

      expect(commentsRepositoryMock.findOne).toHaveBeenCalledWith(commentId);
      expect(commentsRepositoryMock.findOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockComment);
    });

    it('should throw NotFoundException when comment is not found', async () => {
      const commentId = 'non-existent-id';

      commentsRepositoryMock.findOne.mockResolvedValue(null);

      const errorMessage = `comentário com id: ${commentId} não encontrado`;

      await expect(service.findOne(commentId)).rejects.toThrow(new NotFoundException(errorMessage));

      expect(commentsRepositoryMock.findOne).toHaveBeenCalledWith(commentId);
      expect(commentsRepositoryMock.findOne).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    const commentId = 'comment-id-1';
    const dto: UpdateCommentDto = {
      content: 'Updated comment content',
    };

    it('should update a comment successfully', async () => {
      const mockComment = {
        id: commentId,
        content: 'Original content',
        postId: 'post-id-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        author: { id: 'user-id-1', name: 'John Doe' },
      };

      commentsRepositoryMock.findOne.mockResolvedValue(mockComment);
      commentsRepositoryMock.update.mockResolvedValue(undefined);

      await service.update(commentId, dto);

      expect(commentsRepositoryMock.findOne).toHaveBeenCalledWith(commentId);
      expect(commentsRepositoryMock.update).toHaveBeenCalledWith(mockComment.id, dto);
      expect(commentsRepositoryMock.update).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when comment does not exist', async () => {
      commentsRepositoryMock.findOne.mockResolvedValue(null);

      const errorMessage = `comentário com id: ${commentId} não encontrado`;

      await expect(service.update(commentId, dto)).rejects.toThrow(new NotFoundException(errorMessage));

      expect(commentsRepositoryMock.findOne).toHaveBeenCalledWith(commentId);
      expect(commentsRepositoryMock.update).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete a comment successfully', async () => {
      const commentId = 'comment-id-1';
      const mockComment = {
        id: commentId,
        content: 'Comment to delete',
        postId: 'post-id-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        author: { id: 'user-id-1', name: 'John Doe' },
      };

      commentsRepositoryMock.findOne.mockResolvedValue(mockComment);
      commentsRepositoryMock.delete.mockResolvedValue(undefined);

      await service.delete(commentId);

      expect(commentsRepositoryMock.findOne).toHaveBeenCalledWith(commentId);
      expect(commentsRepositoryMock.findOne).toHaveBeenCalledTimes(1);
      expect(commentsRepositoryMock.delete).toHaveBeenCalledWith(commentId);
      expect(commentsRepositoryMock.delete).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when comment does not exist', async () => {
      const commentId = 'non-existent-id';

      commentsRepositoryMock.findOne.mockResolvedValue(null);

      const errorMessage = `comentário com id: ${commentId} não encontrado`;

      await expect(service.delete(commentId)).rejects.toThrow(new NotFoundException(errorMessage));

      expect(commentsRepositoryMock.findOne).toHaveBeenCalledWith(commentId);
      expect(commentsRepositoryMock.delete).not.toHaveBeenCalled();
    });
  });

  describe('findAuthorAndOrgIdFromComment', () => {
    it('should return author and organization ID from comment', async () => {
      const commentId = 'comment-id-1';
      const mockResult = {
        authorId: 'user-id-1',
        organizationId: 'org-id-1',
      };

      commentsRepositoryMock.findAuthorAndOrgIdFromComment.mockResolvedValue(mockResult);

      const result = await service.findAuthorAndOrgIdFromComment(commentId);

      expect(commentsRepositoryMock.findAuthorAndOrgIdFromComment).toHaveBeenCalledWith(commentId);
      expect(commentsRepositoryMock.findAuthorAndOrgIdFromComment).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResult);
    });

    it('should return null when comment does not exist', async () => {
      const commentId = 'non-existent-id';

      commentsRepositoryMock.findAuthorAndOrgIdFromComment.mockResolvedValue(null);

      const result = await service.findAuthorAndOrgIdFromComment(commentId);

      expect(commentsRepositoryMock.findAuthorAndOrgIdFromComment).toHaveBeenCalledWith(commentId);
      expect(result).toBeNull();
    });
  });
});
