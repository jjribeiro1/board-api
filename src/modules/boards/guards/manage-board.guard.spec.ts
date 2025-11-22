import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ManageBoardGuard } from './manage-board.guard';
import { BoardsService } from '../boards.service';
import { createMockUserPayload } from 'test/factories/user-payload-factory';

describe('ManageBoardGuard', () => {
  let guard: ManageBoardGuard;
  let boardsServiceMock: DeepMockProxy<BoardsService>;
  let reflectorMock: DeepMockProxy<Reflector>;
  let executionContextMock: DeepMockProxy<ExecutionContext>;

  beforeEach(async () => {
    boardsServiceMock = mockDeep<BoardsService>();
    reflectorMock = mockDeep<Reflector>();
    executionContextMock = mockDeep<ExecutionContext>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ManageBoardGuard,
        { provide: BoardsService, useValue: boardsServiceMock },
        { provide: Reflector, useValue: reflectorMock },
      ],
    }).compile();

    guard = module.get<ManageBoardGuard>(ManageBoardGuard);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('canActivate', () => {
    it('should return true when user has allowed role in organization', async () => {
      const boardId = 'board-id-1';
      const organizationId = 'org-id-1';
      const mockUser = createMockUserPayload({
        organizations: [{ id: organizationId, name: 'Org 1', role: 'ADMIN' }],
      });
      const mockRequest = {
        params: { id: boardId },
        user: mockUser,
      };
      const mockBoard = {
        id: boardId,
        title: 'Feature Requests',
        description: 'Board for feature requests',
        organizationId,
        authorId: 'user-id-2',
        isLocked: false,
        isPrivate: false,
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
      boardsServiceMock.findOne.mockResolvedValue(mockBoard);

      const result = await guard.canActivate(executionContextMock);

      expect(boardsServiceMock.findOne).toHaveBeenCalledWith(boardId);
      expect(result).toBe(true);
    });

    it('should return false when user does not have allowed role', async () => {
      const boardId = 'board-id-1';
      const organizationId = 'org-id-1';
      const mockUser = createMockUserPayload({
        organizations: [{ id: organizationId, name: 'Org 1', role: 'MEMBER' }],
      });
      const mockRequest = {
        params: { id: boardId },
        user: mockUser,
      };
      const mockBoard = {
        id: boardId,
        title: 'Feature Requests',
        description: 'Board for feature requests',
        organizationId,
        authorId: 'user-id-2',
        isLocked: false,
        isPrivate: false,
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
      boardsServiceMock.findOne.mockResolvedValue(mockBoard);

      const result = await guard.canActivate(executionContextMock);

      expect(boardsServiceMock.findOne).toHaveBeenCalledWith(boardId);
      expect(result).toBe(false);
    });

    it('should return false when user is not a member of the organization', async () => {
      const boardId = 'board-id-1';
      const organizationId = 'org-id-1';
      const mockUser = createMockUserPayload({
        organizations: [{ id: 'org-id-2', name: 'Other Org', role: 'ADMIN' }],
      });
      const mockRequest = {
        params: { id: boardId },
        user: mockUser,
      };
      const mockBoard = {
        id: boardId,
        title: 'Feature Requests',
        description: 'Board for feature requests',
        organizationId,
        authorId: 'user-id-2',
        isLocked: false,
        isPrivate: false,
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
      boardsServiceMock.findOne.mockResolvedValue(mockBoard);

      const result = await guard.canActivate(executionContextMock);

      expect(boardsServiceMock.findOne).toHaveBeenCalledWith(boardId);
      expect(result).toBe(false);
    });

    it('should throw an error when board does not exist', async () => {
      const boardId = 'non-existent-board-id';
      const mockUser = createMockUserPayload({
        organizations: [{ id: 'org-id-1', name: 'Org 1', role: 'ADMIN' }],
      });
      const mockRequest = {
        params: { id: boardId },
        user: mockUser,
      };

      executionContextMock.switchToHttp.mockReturnValue({
        getRequest: () => mockRequest,
        getResponse: jest.fn(),
        getNext: jest.fn(),
      } as any);
      reflectorMock.getAllAndOverride.mockReturnValue(['ADMIN', 'OWNER']);

      const errorMessage = `board com id ${boardId} não encontrado`;
      boardsServiceMock.findOne.mockRejectedValueOnce(new UnauthorizedException(errorMessage));

      await expect(guard.canActivate(executionContextMock)).rejects.toThrow(errorMessage);
      expect(boardsServiceMock.findOne).toHaveBeenCalledWith(boardId);
    });
  });
});
