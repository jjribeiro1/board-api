import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthService } from '../auth.service';
import { Request } from 'express';
import { createMockUser } from 'test/factories/user-payload-factory';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let authServiceMock: DeepMockProxy<AuthService>;
  let reflectorMock: DeepMockProxy<Reflector>;
  let executionContextMock: DeepMockProxy<ExecutionContext>;

  beforeEach(async () => {
    authServiceMock = mockDeep<AuthService>();
    reflectorMock = mockDeep<Reflector>();
    executionContextMock = mockDeep<ExecutionContext>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        { provide: AuthService, useValue: authServiceMock },
        { provide: Reflector, useValue: reflectorMock },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('canActivate', () => {
    it('should return true when is public route', async () => {
      reflectorMock.getAllAndOverride.mockReturnValue(true);

      const result = await guard.canActivate(executionContextMock);

      expect(result).toBe(true);
      expect(authServiceMock.extractUserFromAccessToken).not.toHaveBeenCalled();
    });

    it('should validate token and return true for valid token', async () => {
      const mockUser = createMockUser();
      const mockRequest = {
        cookies: { 'access-token': 'valid-token' },
      } as Partial<Request>;

      reflectorMock.getAllAndOverride.mockReturnValue(false);
      executionContextMock.switchToHttp.mockReturnValue({
        getRequest: () => mockRequest,
        getResponse: jest.fn(),
        getNext: jest.fn(),
      } as any);
      authServiceMock.extractUserFromAccessToken.mockResolvedValue(mockUser);

      const result = await guard.canActivate(executionContextMock);

      expect(authServiceMock.extractUserFromAccessToken).toHaveBeenCalledWith('valid-token');
      expect(result).toBe(true);
      expect(mockRequest['user']).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        organizations: mockUser.organizations,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
    });

    it('should throw UnauthorizedException when token is missing', async () => {
      const mockRequest = {
        cookies: {},
      } as Partial<Request>;

      reflectorMock.getAllAndOverride.mockReturnValue(false);
      executionContextMock.switchToHttp.mockReturnValue({
        getRequest: () => mockRequest,
        getResponse: jest.fn(),
        getNext: jest.fn(),
      } as any);

      await expect(guard.canActivate(executionContextMock)).rejects.toThrow(
        new UnauthorizedException('Token de acesso inválido ou não foi enviado'),
      );
      expect(authServiceMock.extractUserFromAccessToken).not.toHaveBeenCalled();
    });
  });
});
