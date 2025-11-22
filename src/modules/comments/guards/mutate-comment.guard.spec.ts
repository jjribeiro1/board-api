import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { ExecutionContext } from '@nestjs/common';
import { MutateCommentGuard } from './mutate-comment.guard';
import { CommentsService } from '../comments.service';
import { createMockUserPayload } from 'test/factories/user-payload-factory';

describe('MutateCommentGuard', () => {
  let guard: MutateCommentGuard;
  let commentsServiceMock: DeepMockProxy<CommentsService>;
  let reflectorMock: DeepMockProxy<Reflector>;
  let executionContextMock: DeepMockProxy<ExecutionContext>;

  beforeEach(async () => {
    commentsServiceMock = mockDeep<CommentsService>();
    reflectorMock = mockDeep<Reflector>();
    executionContextMock = mockDeep<ExecutionContext>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MutateCommentGuard,
        { provide: CommentsService, useValue: commentsServiceMock },
        { provide: Reflector, useValue: reflectorMock },
      ],
    }).compile();

    guard = module.get<MutateCommentGuard>(MutateCommentGuard);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('canActivate', () => {
    it('should return true when user is the author of the comment', async () => {
      const userId = 'user-id-1';
      const commentId = 'comment-id-1';
      const organizationId = 'org-id-1';
      const mockUser = createMockUserPayload({
        id: userId,
        organizations: [{ id: organizationId, name: 'Org 1', role: 'MEMBER' }],
      });
      const mockRequest = {
        params: { id: commentId },
        user: mockUser,
      };
      const mockCommentInfo = {
        authorId: userId,
        organizationId,
      };

      executionContextMock.switchToHttp.mockReturnValue({
        getRequest: () => mockRequest,
        getResponse: jest.fn(),
        getNext: jest.fn(),
      } as any);
      reflectorMock.getAllAndOverride.mockReturnValue(['ADMIN', 'OWNER']);
      commentsServiceMock.findAuthorAndOrgIdFromComment.mockResolvedValue(mockCommentInfo);

      const result = await guard.canActivate(executionContextMock);

      expect(commentsServiceMock.findAuthorAndOrgIdFromComment).toHaveBeenCalledWith(commentId);
      expect(result).toBe(true);
    });

    it('should return true when user is not the author but has allowed role', async () => {
      const userId = 'user-id-1';
      const authorId = 'user-id-2';
      const commentId = 'comment-id-1';
      const organizationId = 'org-id-1';
      const mockUser = createMockUserPayload({
        id: userId,
        organizations: [{ id: organizationId, name: 'Org 1', role: 'ADMIN' }],
      });
      const mockRequest = {
        params: { id: commentId },
        user: mockUser,
      };
      const mockCommentInfo = {
        authorId,
        organizationId,
      };

      executionContextMock.switchToHttp.mockReturnValue({
        getRequest: () => mockRequest,
        getResponse: jest.fn(),
        getNext: jest.fn(),
      } as any);
      reflectorMock.getAllAndOverride.mockReturnValue(['ADMIN', 'OWNER']);
      commentsServiceMock.findAuthorAndOrgIdFromComment.mockResolvedValue(mockCommentInfo);

      const result = await guard.canActivate(executionContextMock);

      expect(commentsServiceMock.findAuthorAndOrgIdFromComment).toHaveBeenCalledWith(commentId);
      expect(result).toBe(true);
    });

    it('should return false when user is not the author and does not have allowed role', async () => {
      const userId = 'user-id-1';
      const authorId = 'user-id-2';
      const commentId = 'comment-id-1';
      const organizationId = 'org-id-1';
      const mockUser = createMockUserPayload({
        id: userId,
        organizations: [{ id: organizationId, name: 'Org 1', role: 'MEMBER' }],
      });
      const mockRequest = {
        params: { id: commentId },
        user: mockUser,
      };
      const mockCommentInfo = {
        authorId,
        organizationId,
      };

      executionContextMock.switchToHttp.mockReturnValue({
        getRequest: () => mockRequest,
        getResponse: jest.fn(),
        getNext: jest.fn(),
      } as any);
      reflectorMock.getAllAndOverride.mockReturnValue(['ADMIN', 'OWNER']);
      commentsServiceMock.findAuthorAndOrgIdFromComment.mockResolvedValue(mockCommentInfo);

      const result = await guard.canActivate(executionContextMock);

      expect(commentsServiceMock.findAuthorAndOrgIdFromComment).toHaveBeenCalledWith(commentId);
      expect(result).toBe(false);
    });

    it('should return false when user is not a member of the organization', async () => {
      const userId = 'user-id-1';
      const authorId = 'user-id-2';
      const commentId = 'comment-id-1';
      const organizationId = 'org-id-1';
      const mockUser = createMockUserPayload({
        id: userId,
        organizations: [{ id: 'org-id-2', name: 'Other Org', role: 'ADMIN' }],
      });
      const mockRequest = {
        params: { id: commentId },
        user: mockUser,
      };
      const mockCommentInfo = {
        authorId,
        organizationId,
      };

      executionContextMock.switchToHttp.mockReturnValue({
        getRequest: () => mockRequest,
        getResponse: jest.fn(),
        getNext: jest.fn(),
      } as any);
      reflectorMock.getAllAndOverride.mockReturnValue(['ADMIN', 'OWNER']);
      commentsServiceMock.findAuthorAndOrgIdFromComment.mockResolvedValue(mockCommentInfo);

      const result = await guard.canActivate(executionContextMock);

      expect(commentsServiceMock.findAuthorAndOrgIdFromComment).toHaveBeenCalledWith(commentId);
      expect(result).toBe(false);
    });

    it('should return false when comment does not exist', async () => {
      const userId = 'user-id-1';
      const commentId = 'non-existent-comment-id';
      const mockUser = createMockUserPayload({
        id: userId,
        organizations: [{ id: 'org-id-1', name: 'Org 1', role: 'ADMIN' }],
      });
      const mockRequest = {
        params: { id: commentId },
        user: mockUser,
      };

      executionContextMock.switchToHttp.mockReturnValue({
        getRequest: () => mockRequest,
        getResponse: jest.fn(),
        getNext: jest.fn(),
      } as any);
      reflectorMock.getAllAndOverride.mockReturnValue(['ADMIN', 'OWNER']);
      commentsServiceMock.findAuthorAndOrgIdFromComment.mockResolvedValue(null);

      const result = await guard.canActivate(executionContextMock);

      expect(commentsServiceMock.findAuthorAndOrgIdFromComment).toHaveBeenCalledWith(commentId);
      expect(result).toBe(false);
    });

    it('should return true when user is author even without allowed role', async () => {
      const userId = 'user-id-1';
      const commentId = 'comment-id-1';
      const organizationId = 'org-id-1';
      const mockUser = createMockUserPayload({
        id: userId,
        organizations: [{ id: organizationId, name: 'Org 1', role: 'MEMBER' }],
      });
      const mockRequest = {
        params: { id: commentId },
        user: mockUser,
      };
      const mockCommentInfo = {
        authorId: userId,
        organizationId,
      };

      executionContextMock.switchToHttp.mockReturnValue({
        getRequest: () => mockRequest,
        getResponse: jest.fn(),
        getNext: jest.fn(),
      } as any);
      reflectorMock.getAllAndOverride.mockReturnValue(['ADMIN', 'OWNER']);
      commentsServiceMock.findAuthorAndOrgIdFromComment.mockResolvedValue(mockCommentInfo);

      const result = await guard.canActivate(executionContextMock);

      expect(commentsServiceMock.findAuthorAndOrgIdFromComment).toHaveBeenCalledWith(commentId);
      expect(result).toBe(true);
    });
  });
});
