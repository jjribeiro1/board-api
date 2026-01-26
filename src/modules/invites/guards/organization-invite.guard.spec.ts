import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { OrganizationInviteGuard } from './organization-invite.guard';
import { createMockUserPayload } from 'test/factories/user-payload-factory';
import { OrganizationRolesOptions } from 'src/common/types/user-organization-role';

describe('OrganizationInviteGuard', () => {
  let guard: OrganizationInviteGuard;
  let reflectorMock: DeepMockProxy<Reflector>;
  let executionContextMock: DeepMockProxy<ExecutionContext>;

  beforeEach(async () => {
    reflectorMock = mockDeep<Reflector>();
    executionContextMock = mockDeep<ExecutionContext>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [OrganizationInviteGuard, { provide: Reflector, useValue: reflectorMock }],
    }).compile();

    guard = module.get<OrganizationInviteGuard>(OrganizationInviteGuard);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('should return true when no roles are specified', async () => {
      const mockRequest = { user: {}, body: {} };
      executionContextMock.switchToHttp.mockReturnValue({
        getRequest: () => mockRequest,
      } as any);
      reflectorMock.getAllAndOverride.mockReturnValue([]);

      const result = await guard.canActivate(executionContextMock);

      expect(result).toBe(true);
    });

    it('should throw ForbiddenException when organizationId is not present in DTO', async () => {
      const mockUser = createMockUserPayload({ organizations: [{ id: 'org-1', role: 'ADMIN', name: 'org-1' }] });
      const mockRequest = { user: mockUser, body: {} };
      executionContextMock.switchToHttp.mockReturnValue({
        getRequest: () => mockRequest,
      } as any);
      reflectorMock.getAllAndOverride.mockReturnValue([OrganizationRolesOptions.ADMIN]);

      await expect(guard.canActivate(executionContextMock)).rejects.toThrow(
        new ForbiddenException('ID da organização é obrigatório'),
      );
    });

    it('should throw ForbiddenException when user does not belong to organization', async () => {
      const mockUser = createMockUserPayload({ organizations: [{ id: 'org-1', role: 'ADMIN', name: 'org-1' }] });
      const mockRequest = { user: mockUser, body: { organizationId: 'org-2' } };
      executionContextMock.switchToHttp.mockReturnValue({
        getRequest: () => mockRequest,
      } as any);
      reflectorMock.getAllAndOverride.mockReturnValue([OrganizationRolesOptions.ADMIN]);

      await expect(guard.canActivate(executionContextMock)).rejects.toThrow(
        new ForbiddenException('Usuário não pertence a esta organização'),
      );
    });

    it('should throw ForbiddenException when user does not have permission to invite members', async () => {
      const mockUser = createMockUserPayload({ organizations: [{ id: 'org-1', role: 'MEMBER', name: 'org-1' }] });
      const mockRequest = { user: mockUser, body: { organizationId: 'org-1' } };
      executionContextMock.switchToHttp.mockReturnValue({
        getRequest: () => mockRequest,
      } as any);
      reflectorMock.getAllAndOverride.mockReturnValue([OrganizationRolesOptions.ADMIN]);

      await expect(guard.canActivate(executionContextMock)).rejects.toThrow(
        new ForbiddenException('Usuário não tem permissão para convidar membros'),
      );
    });

    it('should return true when user has one of the allowed roles', async () => {
      const mockUser = createMockUserPayload({ organizations: [{ id: 'org-1', role: 'ADMIN', name: 'org-1' }] });
      const mockRequest = { user: mockUser, body: { organizationId: 'org-1' } };
      executionContextMock.switchToHttp.mockReturnValue({
        getRequest: () => mockRequest,
      } as any);
      reflectorMock.getAllAndOverride.mockReturnValue([OrganizationRolesOptions.ADMIN, OrganizationRolesOptions.OWNER]);

      const result = await guard.canActivate(executionContextMock);

      expect(result).toBe(true);
    });
  });
});
