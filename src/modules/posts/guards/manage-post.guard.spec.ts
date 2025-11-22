import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { ExecutionContext } from '@nestjs/common';
import { ManagePostGuard } from './manage-post.guard';
import { PostsService } from '../posts.service';
import { createMockUserPayload } from 'test/factories/user-payload-factory';

describe('ManagePostGuard', () => {
  let guard: ManagePostGuard;
  let postsServiceMock: DeepMockProxy<PostsService>;
  let reflectorMock: DeepMockProxy<Reflector>;
  let executionContextMock: DeepMockProxy<ExecutionContext>;

  beforeEach(async () => {
    postsServiceMock = mockDeep<PostsService>();
    reflectorMock = mockDeep<Reflector>();
    executionContextMock = mockDeep<ExecutionContext>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ManagePostGuard,
        { provide: PostsService, useValue: postsServiceMock },
        { provide: Reflector, useValue: reflectorMock },
      ],
    }).compile();

    guard = module.get<ManagePostGuard>(ManagePostGuard);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('canActivate', () => {
    it('should return true when user has allowed role in organization', async () => {
      const postId = 'post-id-1';
      const organizationId = 'org-id-1';
      const mockUser = createMockUserPayload({
        organizations: [{ id: organizationId, name: 'Org 1', role: 'ADMIN' }],
      });
      const mockRequest = {
        params: { id: postId },
        user: mockUser,
      };
      const mockPostInfo = {
        authorId: 'user-id-2',
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

    it('should return false when user does not have allowed role', async () => {
      const postId = 'post-id-1';
      const organizationId = 'org-id-1';
      const mockUser = createMockUserPayload({
        organizations: [{ id: organizationId, name: 'Org 1', role: 'MEMBER' }],
      });
      const mockRequest = {
        params: { id: postId },
        user: mockUser,
      };
      const mockPostInfo = {
        authorId: 'user-id-2',
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
      const postId = 'post-id-1';
      const organizationId = 'org-id-1';
      const mockUser = createMockUserPayload({
        organizations: [{ id: 'org-id-2', name: 'Other Org', role: 'ADMIN' }],
      });
      const mockRequest = {
        params: { id: postId },
        user: mockUser,
      };
      const mockPostInfo = {
        authorId: 'user-id-2',
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
      const postId = 'non-existent-post-id';
      const mockUser = createMockUserPayload({
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

    it('should return false even when user is the author but without allowed role', async () => {
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
      expect(result).toBe(false);
    });
  });
});
