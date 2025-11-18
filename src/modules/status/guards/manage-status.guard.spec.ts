import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { ExecutionContext } from '@nestjs/common';
import { ManageStatusGuard } from './manage-status.guard';
import { StatusService } from '../status.service';
import { createMockUserPayload } from 'test/factories/user-payload-factory';

describe('ManageStatusGuard', () => {
  let guard: ManageStatusGuard;
  let statusServiceMock: DeepMockProxy<StatusService>;
  let reflectorMock: DeepMockProxy<Reflector>;
  let executionContextMock: DeepMockProxy<ExecutionContext>;

  beforeEach(async () => {
    statusServiceMock = mockDeep<StatusService>();
    reflectorMock = mockDeep<Reflector>();
    executionContextMock = mockDeep<ExecutionContext>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ManageStatusGuard,
        { provide: StatusService, useValue: statusServiceMock },
        { provide: Reflector, useValue: reflectorMock },
      ],
    }).compile();

    guard = module.get<ManageStatusGuard>(ManageStatusGuard);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('canActivate', () => {
    it('should return true when user has allowed role in organization', async () => {
      const statusId = 'status-id-1';
      const organizationId = 'org-id-1';
      const mockUser = createMockUserPayload({
        organizations: [{ id: organizationId, name: 'Org 1', role: 'ADMIN' }],
      });
      const mockRequest = {
        params: { id: statusId },
        user: mockUser,
      };
      const mockStatus = {
        id: statusId,
        name: 'In Progress',
        color: '#FFFF00',
        organizationId,
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      executionContextMock.switchToHttp.mockReturnValue({
        getRequest: () => mockRequest,
        getResponse: jest.fn(),
        getNext: jest.fn(),
      } as any);
      reflectorMock.getAllAndOverride.mockReturnValue(['ADMIN', 'OWNER']);
      statusServiceMock.findOne.mockResolvedValue(mockStatus);

      const result = await guard.canActivate(executionContextMock);

      expect(statusServiceMock.findOne).toHaveBeenCalledWith(statusId);
      expect(result).toBe(true);
    });

    it('should return false when user does not have allowed role', async () => {
      const statusId = 'status-id-1';
      const organizationId = 'org-id-1';
      const mockUser = createMockUserPayload({
        organizations: [{ id: organizationId, name: 'Org 1', role: 'MEMBER' }],
      });
      const mockRequest = {
        params: { id: statusId },
        user: mockUser,
      };
      const mockStatus = {
        id: statusId,
        name: 'In Progress',
        color: '#FFFF00',
        organizationId,
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      executionContextMock.switchToHttp.mockReturnValue({
        getRequest: () => mockRequest,
        getResponse: jest.fn(),
        getNext: jest.fn(),
      } as any);
      reflectorMock.getAllAndOverride.mockReturnValue(['ADMIN', 'OWNER']);
      statusServiceMock.findOne.mockResolvedValue(mockStatus);

      const result = await guard.canActivate(executionContextMock);

      expect(statusServiceMock.findOne).toHaveBeenCalledWith(statusId);
      expect(result).toBe(false);
    });

    it('should return false when user is not a member of the organization', async () => {
      const statusId = 'status-id-1';
      const organizationId = 'org-id-1';
      const mockUser = createMockUserPayload({
        organizations: [{ id: 'org-id-2', name: 'Other Org', role: 'ADMIN' }],
      });
      const mockRequest = {
        params: { id: statusId },
        user: mockUser,
      };
      const mockStatus = {
        id: statusId,
        name: 'In Progress',
        color: '#FFFF00',
        organizationId,
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      executionContextMock.switchToHttp.mockReturnValue({
        getRequest: () => mockRequest,
        getResponse: jest.fn(),
        getNext: jest.fn(),
      } as any);
      reflectorMock.getAllAndOverride.mockReturnValue(['ADMIN', 'OWNER']);
      statusServiceMock.findOne.mockResolvedValue(mockStatus);

      const result = await guard.canActivate(executionContextMock);

      expect(statusServiceMock.findOne).toHaveBeenCalledWith(statusId);
      expect(result).toBe(false);
    });

    it('should return false when status does not exist', async () => {
      const statusId = 'non-existent-status-id';
      const mockUser = createMockUserPayload({
        organizations: [{ id: 'org-id-1', name: 'Org 1', role: 'ADMIN' }],
      });
      const mockRequest = {
        params: { id: statusId },
        user: mockUser,
      };

      executionContextMock.switchToHttp.mockReturnValue({
        getRequest: () => mockRequest,
        getResponse: jest.fn(),
        getNext: jest.fn(),
      } as any);
      reflectorMock.getAllAndOverride.mockReturnValue(['ADMIN', 'OWNER']);
      statusServiceMock.findOne.mockResolvedValue(null);

      const result = await guard.canActivate(executionContextMock);

      expect(statusServiceMock.findOne).toHaveBeenCalledWith(statusId);
      expect(result).toBe(false);
    });
  });
});
