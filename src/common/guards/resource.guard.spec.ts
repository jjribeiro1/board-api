import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { ExecutionContext } from '@nestjs/common';
import { ResourceGuard } from './resource.guard';
import { ResourceOwnershipResolver } from '../interfaces/resource-info.interface';
import { RESOURCE_RESOLVER } from 'src/constants';
import { createMockUserPayload } from 'test/factories/user-payload-factory';

describe('ResourceGuard', () => {
  let guard: ResourceGuard;
  let reflectorMock: DeepMockProxy<Reflector>;
  let resourceResolverMock: DeepMockProxy<ResourceOwnershipResolver>;
  let executionContextMock: DeepMockProxy<ExecutionContext>;

  beforeEach(async () => {
    reflectorMock = mockDeep<Reflector>();
    resourceResolverMock = mockDeep<ResourceOwnershipResolver>();
    executionContextMock = mockDeep<ExecutionContext>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResourceGuard,
        { provide: Reflector, useValue: reflectorMock },
        { provide: RESOURCE_RESOLVER, useValue: resourceResolverMock },
      ],
    }).compile();

    guard = module.get<ResourceGuard>(ResourceGuard);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('should throw ForbiddenException when resource is not found', async () => {
      const mockUser = createMockUserPayload();
      const mockRequest = {
        user: mockUser,
        params: { id: 'resource-id' },
      };
      executionContextMock.switchToHttp.mockReturnValue({
        getRequest: () => mockRequest,
      } as any);
      reflectorMock.getAllAndOverride.mockReturnValue(['ADMIN']);
      resourceResolverMock.findOrgAndAuthorId.mockResolvedValue(null);

      await expect(guard.canActivate(executionContextMock)).rejects.toThrow('Recurso não encontrado');
    });

    it('should return true when user is the author and allowAuthor is true', async () => {
      const mockUser = createMockUserPayload({ id: 'user-id-1' });
      const mockRequest = {
        user: mockUser,
        params: { id: 'resource-id' },
      };
      executionContextMock.switchToHttp.mockReturnValue({
        getRequest: () => mockRequest,
      } as any);
      reflectorMock.getAllAndOverride.mockReturnValueOnce(['ADMIN']).mockReturnValueOnce(true);
      resourceResolverMock.findOrgAndAuthorId.mockResolvedValue({
        organizationId: 'org-id-1',
        authorId: 'user-id-1',
      });

      const result = await guard.canActivate(executionContextMock);

      expect(result).toBe(true);
    });

    it('should return false when user is the author but allowAuthor is false', async () => {
      const mockUser = createMockUserPayload({
        id: 'user-id-1',
        organizations: [{ id: 'org-id-2', name: 'Another Org', role: 'MEMBER' }],
      });
      const mockRequest = {
        user: mockUser,
        params: { id: 'resource-id' },
      };
      executionContextMock.switchToHttp.mockReturnValue({
        getRequest: () => mockRequest,
      } as any);
      reflectorMock.getAllAndOverride.mockReturnValueOnce(['ADMIN']).mockReturnValueOnce(false);
      resourceResolverMock.findOrgAndAuthorId.mockResolvedValue({
        organizationId: 'org-id-1',
        authorId: 'user-id-1',
      });

      const result = await guard.canActivate(executionContextMock);

      expect(result).toBe(false);
    });

    it('should return true when user has allowed role in resource organization', async () => {
      const mockUser = createMockUserPayload({
        organizations: [
          { id: 'org-id-1', name: 'Org 1', role: 'ADMIN' },
          { id: 'org-id-2', name: 'Org 2', role: 'MEMBER' },
        ],
      });
      const mockRequest = {
        user: mockUser,
        params: { id: 'resource-id' },
      };
      executionContextMock.switchToHttp.mockReturnValue({
        getRequest: () => mockRequest,
      } as any);
      reflectorMock.getAllAndOverride.mockReturnValueOnce(['ADMIN', 'OWNER']).mockReturnValueOnce(false);
      resourceResolverMock.findOrgAndAuthorId.mockResolvedValue({
        organizationId: 'org-id-1',
        authorId: 'other-user-id',
      });

      const result = await guard.canActivate(executionContextMock);

      expect(result).toBe(true);
    });

    it('should return false when user does not have allowed role in resource organization', async () => {
      const mockUser = createMockUserPayload({
        organizations: [{ id: 'org-id-1', name: 'Org 1', role: 'MEMBER' }],
      });
      const mockRequest = {
        user: mockUser,
        params: { id: 'resource-id' },
      };
      executionContextMock.switchToHttp.mockReturnValue({
        getRequest: () => mockRequest,
      } as any);
      reflectorMock.getAllAndOverride.mockReturnValueOnce(['ADMIN', 'OWNER']).mockReturnValueOnce(false);
      resourceResolverMock.findOrgAndAuthorId.mockResolvedValue({
        organizationId: 'org-id-1',
        authorId: 'other-user-id',
      });

      const result = await guard.canActivate(executionContextMock);

      expect(result).toBe(false);
    });

    it('should return false when user is not in resource organization', async () => {
      const mockUser = createMockUserPayload({
        organizations: [{ id: 'org-id-2', name: 'Org 2', role: 'OWNER' }],
      });
      const mockRequest = {
        user: mockUser,
        params: { id: 'resource-id' },
      };
      executionContextMock.switchToHttp.mockReturnValue({
        getRequest: () => mockRequest,
      } as any);
      reflectorMock.getAllAndOverride.mockReturnValueOnce(['ADMIN', 'OWNER']).mockReturnValueOnce(false);
      resourceResolverMock.findOrgAndAuthorId.mockResolvedValue({
        organizationId: 'org-id-1',
        authorId: 'other-user-id',
      });

      const result = await guard.canActivate(executionContextMock);

      expect(result).toBe(false);
    });

    it('should prioritize author check over role check when allowAuthor is true', async () => {
      const mockUser = createMockUserPayload({
        id: 'user-id-1',
        organizations: [{ id: 'org-id-1', name: 'Org 1', role: 'MEMBER' }],
      });
      const mockRequest = {
        user: mockUser,
        params: { id: 'resource-id' },
      };
      executionContextMock.switchToHttp.mockReturnValue({
        getRequest: () => mockRequest,
      } as any);
      reflectorMock.getAllAndOverride.mockReturnValueOnce(['ADMIN', 'OWNER']).mockReturnValueOnce(true);
      resourceResolverMock.findOrgAndAuthorId.mockResolvedValue({
        organizationId: 'org-id-1',
        authorId: 'user-id-1',
      });

      const result = await guard.canActivate(executionContextMock);

      expect(result).toBe(true);
    });

    it('should throw ForbiddenException when no allowed roles are defined', async () => {
      const mockUser = createMockUserPayload({
        organizations: [{ id: 'org-id-1', name: 'Org 1', role: 'ADMIN' }],
      });
      const mockRequest = {
        user: mockUser,
        params: { id: 'resource-id' },
      };
      executionContextMock.switchToHttp.mockReturnValue({
        getRequest: () => mockRequest,
      } as any);
      reflectorMock.getAllAndOverride.mockReturnValueOnce(null).mockReturnValueOnce(null);
      resourceResolverMock.findOrgAndAuthorId.mockResolvedValue({
        organizationId: 'org-id-1',
        authorId: 'other-user-id',
      });

      await expect(guard.canActivate(executionContextMock)).rejects.toThrow(
        'Nenhum nível de acesso organizacional foi definido',
      );
    });

    it('should throw ForbiddenException when allowed roles is empty array', async () => {
      const mockUser = createMockUserPayload({
        organizations: [{ id: 'org-id-1', name: 'Org 1', role: 'ADMIN' }],
      });
      const mockRequest = {
        user: mockUser,
        params: { id: 'resource-id' },
      };
      executionContextMock.switchToHttp.mockReturnValue({
        getRequest: () => mockRequest,
      } as any);
      reflectorMock.getAllAndOverride.mockReturnValueOnce([]).mockReturnValueOnce(false);
      resourceResolverMock.findOrgAndAuthorId.mockResolvedValue({
        organizationId: 'org-id-1',
        authorId: 'other-user-id',
      });

      await expect(guard.canActivate(executionContextMock)).rejects.toThrow(
        'Nenhum nível de acesso organizacional foi definido',
      );
    });
  });
});
