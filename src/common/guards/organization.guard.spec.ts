import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { OrganizationGuard } from './organization.guard';
import { createMockUserPayload } from 'test/factories/user-payload-factory';

describe('OrganizationGuard', () => {
  let guard: OrganizationGuard;
  let reflectorMock: DeepMockProxy<Reflector>;
  let executionContextMock: DeepMockProxy<ExecutionContext>;

  beforeEach(async () => {
    reflectorMock = mockDeep<Reflector>();
    executionContextMock = mockDeep<ExecutionContext>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [OrganizationGuard, { provide: Reflector, useValue: reflectorMock }],
    }).compile();

    guard = module.get<OrganizationGuard>(OrganizationGuard);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('should throw ForbiddenException when no allowed roles are defined', async () => {
      const mockUser = createMockUserPayload();
      const mockRequest = {
        user: mockUser,
        body: { organizationId: 'org-id-1' },
      };
      executionContextMock.switchToHttp.mockReturnValue({
        getRequest: () => mockRequest,
      } as any);
      reflectorMock.getAllAndOverride.mockReturnValue([]);

      await expect(guard.canActivate(executionContextMock)).rejects.toThrow(
        new ForbiddenException('Nenhum nível de acesso organizacional foi definido'),
      );
    });

    it('should throw ForbiddenException when organizationId is not present in body', async () => {
      const mockUser = createMockUserPayload();
      const mockRequest = {
        user: mockUser,
        body: {},
      };
      executionContextMock.switchToHttp.mockReturnValue({
        getRequest: () => mockRequest,
      } as any);
      reflectorMock.getAllAndOverride.mockReturnValue(['ADMIN', 'OWNER']);

      await expect(guard.canActivate(executionContextMock)).rejects.toThrow(
        new ForbiddenException('ID da organização é obrigatório'),
      );
    });

    it('should throw ForbiddenException when user does not belong to the organization', async () => {
      const mockUser = createMockUserPayload({
        organizations: [{ id: 'org-id-2', name: 'Other Org', role: 'ADMIN' }],
      });
      const mockRequest = {
        user: mockUser,
        body: { organizationId: 'org-id-1' },
      };
      executionContextMock.switchToHttp.mockReturnValue({
        getRequest: () => mockRequest,
      } as any);
      reflectorMock.getAllAndOverride.mockReturnValue(['ADMIN', 'OWNER']);

      await expect(guard.canActivate(executionContextMock)).rejects.toThrow(
        new ForbiddenException('Usuário não pertence a esta organização'),
      );
    });

    it('should throw ForbiddenException when user does not have permission (MEMBER role)', async () => {
      const mockUser = createMockUserPayload({
        organizations: [{ id: 'org-id-1', name: 'Org 1', role: 'MEMBER' }],
      });
      const mockRequest = {
        user: mockUser,
        body: { organizationId: 'org-id-1' },
      };
      executionContextMock.switchToHttp.mockReturnValue({
        getRequest: () => mockRequest,
      } as any);
      reflectorMock.getAllAndOverride.mockReturnValue(['ADMIN', 'OWNER']);

      await expect(guard.canActivate(executionContextMock)).rejects.toThrow(
        new ForbiddenException('Usuário não tem permissão para realizar esta operação'),
      );
    });

    it('should return true when user belongs to multiple organizations and has permission in the target one', async () => {
      const mockUser = createMockUserPayload({
        organizations: [
          { id: 'org-id-1', name: 'Org 1', role: 'ADMIN' },
          { id: 'org-id-2', name: 'Org 2', role: 'MEMBER' },
          { id: 'org-id-3', name: 'Org 3', role: 'MEMBER' },
        ],
      });
      const mockRequest = {
        user: mockUser,
        body: { organizationId: 'org-id-1' },
      };
      executionContextMock.switchToHttp.mockReturnValue({
        getRequest: () => mockRequest,
      } as any);
      reflectorMock.getAllAndOverride.mockReturnValue(['ADMIN', 'OWNER']);

      const result = await guard.canActivate(executionContextMock);

      expect(result).toBe(true);
    });

    it('should throw ForbiddenException when user belongs to multiple organizations but lacks permission in target one', async () => {
      const mockUser = createMockUserPayload({
        organizations: [
          { id: 'org-id-1', name: 'Org 1', role: 'MEMBER' },
          { id: 'org-id-2', name: 'Org 2', role: 'ADMIN' },
          { id: 'org-id-3', name: 'Org 3', role: 'OWNER' },
        ],
      });
      const mockRequest = {
        user: mockUser,
        body: { organizationId: 'org-id-1' },
      };
      executionContextMock.switchToHttp.mockReturnValue({
        getRequest: () => mockRequest,
      } as any);
      reflectorMock.getAllAndOverride.mockReturnValue(['ADMIN', 'OWNER']);

      await expect(guard.canActivate(executionContextMock)).rejects.toThrow(
        new ForbiddenException('Usuário não tem permissão para realizar esta operação'),
      );
    });

    it('should throw ForbiddenException when user does not have one of the allowed roles', async () => {
      const mockUser = createMockUserPayload({
        organizations: [{ id: 'org-id-1', name: 'Org 1', role: 'ADMIN' }],
      });
      const mockRequest = {
        user: mockUser,
        body: { organizationId: 'org-id-1' },
      };
      executionContextMock.switchToHttp.mockReturnValue({
        getRequest: () => mockRequest,
      } as any);
      reflectorMock.getAllAndOverride.mockReturnValue(['OWNER']);

      await expect(guard.canActivate(executionContextMock)).rejects.toThrow(
        new ForbiddenException('Usuário não tem permissão para realizar esta operação'),
      );
    });

    it('should work correctly with single allowed role', async () => {
      const mockUser = createMockUserPayload({
        organizations: [{ id: 'org-id-1', name: 'Org 1', role: 'OWNER' }],
      });
      const mockRequest = {
        user: mockUser,
        body: { organizationId: 'org-id-1' },
      };
      executionContextMock.switchToHttp.mockReturnValue({
        getRequest: () => mockRequest,
      } as any);
      reflectorMock.getAllAndOverride.mockReturnValue(['OWNER']);

      const result = await guard.canActivate(executionContextMock);

      expect(result).toBe(true);
    });
  });
});
