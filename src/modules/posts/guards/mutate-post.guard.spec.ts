import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { ExecutionContext } from '@nestjs/common';
import { MutatePostGuard } from './mutate-post.guard';
import { PostsService } from '../posts.service';
import { createMockUserPayload } from 'test/factories/user-payload-factory';

describe('MutatePostGuard', () => {
  let guard: MutatePostGuard;
  let postsServiceMock: DeepMockProxy<PostsService>;
  let reflectorMock: DeepMockProxy<Reflector>;
  let executionContextMock: DeepMockProxy<ExecutionContext>;

  beforeEach(async () => {
    postsServiceMock = mockDeep<PostsService>();
    reflectorMock = mockDeep<Reflector>();
    executionContextMock = mockDeep<ExecutionContext>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MutatePostGuard,
        { provide: PostsService, useValue: postsServiceMock },
        { provide: Reflector, useValue: reflectorMock },
      ],
    }).compile();

    guard = module.get<MutatePostGuard>(MutatePostGuard);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('canActivate', () => {
    it('should return true when user is the author of the post', async () => {
      const userId = 'user-id-1';
      const postId = 'post-id-1';
      const organizationId = 'org-id-1';
      const mockUser = createMockUserPayload({
        id: userId,
        organizations: [{ id: organizationId, name: 'Org 1', role: 'MEMBER' }],
      });
      const mockRequest = {
        params: { id: postId },
        user: mockUser,
      };
      const mockPostInfo = {
        authorId: userId,
        organizationId,
      };

      executionContextMock.switchToHttp.mockReturnValue({
        getRequest: () => mockRequest,
        getResponse: jest.fn(),
        getNext: jest.fn(),
      } as any);
      reflectorMock.getAllAndOverride.mockReturnValue(['ADMIN', 'OWNER']);
      postsServiceMock.findAuthorAndOrgIdFromPost.mockResolvedValue(mockPostInfo);

      const result = await guard.canActivate(executionContextMock);

      expect(postsServiceMock.findAuthorAndOrgIdFromPost).toHaveBeenCalledWith(postId);
      expect(result).toBe(true);
    });

    it('should return true when user is not the author but has allowed role', async () => {
      const userId = 'user-id-1';
      const authorId = 'user-id-2';
      const postId = 'post-id-1';
      const organizationId = 'org-id-1';
      const mockUser = createMockUserPayload({
        id: userId,
        organizations: [{ id: organizationId, name: 'Org 1', role: 'ADMIN' }],
      });
      const mockRequest = {
        params: { id: postId },
        user: mockUser,
      };
      const mockPostInfo = {
        authorId,
        organizationId,
      };

      executionContextMock.switchToHttp.mockReturnValue({
        getRequest: () => mockRequest,
        getResponse: jest.fn(),
        getNext: jest.fn(),
      } as any);
      reflectorMock.getAllAndOverride.mockReturnValue(['ADMIN', 'OWNER']);
      postsServiceMock.findAuthorAndOrgIdFromPost.mockResolvedValue(mockPostInfo);

      const result = await guard.canActivate(executionContextMock);

      expect(postsServiceMock.findAuthorAndOrgIdFromPost).toHaveBeenCalledWith(postId);
      expect(result).toBe(true);
    });

    it('should return false when user is not the author and does not have allowed role', async () => {
      const userId = 'user-id-1';
      const authorId = 'user-id-2';
      const postId = 'post-id-1';
      const organizationId = 'org-id-1';
      const mockUser = createMockUserPayload({
        id: userId,
        organizations: [{ id: organizationId, name: 'Org 1', role: 'MEMBER' }],
      });
      const mockRequest = {
        params: { id: postId },
        user: mockUser,
      };
      const mockPostInfo = {
        authorId,
        organizationId,
      };

      executionContextMock.switchToHttp.mockReturnValue({
        getRequest: () => mockRequest,
        getResponse: jest.fn(),
        getNext: jest.fn(),
      } as any);
      reflectorMock.getAllAndOverride.mockReturnValue(['ADMIN', 'OWNER']);
      postsServiceMock.findAuthorAndOrgIdFromPost.mockResolvedValue(mockPostInfo);

      const result = await guard.canActivate(executionContextMock);

      expect(postsServiceMock.findAuthorAndOrgIdFromPost).toHaveBeenCalledWith(postId);
      expect(result).toBe(false);
    });

    it('should return false when user is not a member of the organization', async () => {
      const userId = 'user-id-1';
      const authorId = 'user-id-2';
      const postId = 'post-id-1';
      const organizationId = 'org-id-1';
      const mockUser = createMockUserPayload({
        id: userId,
        organizations: [{ id: 'org-id-2', name: 'Other Org', role: 'ADMIN' }],
      });
      const mockRequest = {
        params: { id: postId },
        user: mockUser,
      };
      const mockPostInfo = {
        authorId,
        organizationId,
      };

      executionContextMock.switchToHttp.mockReturnValue({
        getRequest: () => mockRequest,
        getResponse: jest.fn(),
        getNext: jest.fn(),
      } as any);
      reflectorMock.getAllAndOverride.mockReturnValue(['ADMIN', 'OWNER']);
      postsServiceMock.findAuthorAndOrgIdFromPost.mockResolvedValue(mockPostInfo);

      const result = await guard.canActivate(executionContextMock);

      expect(postsServiceMock.findAuthorAndOrgIdFromPost).toHaveBeenCalledWith(postId);
      expect(result).toBe(false);
    });

    it('should return false when post does not exist', async () => {
      const userId = 'user-id-1';
      const postId = 'non-existent-post-id';
      const mockUser = createMockUserPayload({
        id: userId,
        organizations: [{ id: 'org-id-1', name: 'Org 1', role: 'ADMIN' }],
      });
      const mockRequest = {
        params: { id: postId },
        user: mockUser,
      };

      executionContextMock.switchToHttp.mockReturnValue({
        getRequest: () => mockRequest,
        getResponse: jest.fn(),
        getNext: jest.fn(),
      } as any);
      reflectorMock.getAllAndOverride.mockReturnValue(['ADMIN', 'OWNER']);
      postsServiceMock.findAuthorAndOrgIdFromPost.mockResolvedValue(null);

      const result = await guard.canActivate(executionContextMock);

      expect(postsServiceMock.findAuthorAndOrgIdFromPost).toHaveBeenCalledWith(postId);
      expect(result).toBe(false);
    });

    it('should return true when user is author even without allowed role', async () => {
      const userId = 'user-id-1';
      const postId = 'post-id-1';
      const organizationId = 'org-id-1';
      const mockUser = createMockUserPayload({
        id: userId,
        organizations: [{ id: organizationId, name: 'Org 1', role: 'MEMBER' }],
      });
      const mockRequest = {
        params: { id: postId },
        user: mockUser,
      };
      const mockPostInfo = {
        authorId: userId,
        organizationId,
      };

      executionContextMock.switchToHttp.mockReturnValue({
        getRequest: () => mockRequest,
        getResponse: jest.fn(),
        getNext: jest.fn(),
      } as any);
      reflectorMock.getAllAndOverride.mockReturnValue(['ADMIN', 'OWNER']);
      postsServiceMock.findAuthorAndOrgIdFromPost.mockResolvedValue(mockPostInfo);

      const result = await guard.canActivate(executionContextMock);

      expect(postsServiceMock.findAuthorAndOrgIdFromPost).toHaveBeenCalledWith(postId);
      expect(result).toBe(true);
    });
  });
});
