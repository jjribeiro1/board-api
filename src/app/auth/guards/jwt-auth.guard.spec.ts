import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthService } from '../auth.service';
import { mockAuthService } from 'test/mocks/auth';
import { mockUserEntity } from 'test/mocks/user';

describe('JwtAuthGuard', () => {
  let jwtAuthGuard: JwtAuthGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    jwtAuthGuard = module.get<JwtAuthGuard>(JwtAuthGuard);
  });

  describe('canActivate', () => {
    it('should throw UnauthorizedException when authorization header is missing', async () => {
      const mockExecutionContext = createMock<ExecutionContext>({
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {},
          }),
        }),
      });

      await expect(
        jwtAuthGuard.canActivate(mockExecutionContext),
      ).rejects.toThrow(
        new UnauthorizedException('Authorization header inválido'),
      );
    });

    it('should throw UnauthorizedException when token is malformed', async () => {
      const mockExecutionContext = createMock<ExecutionContext>({
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {
              authorization: 'bearertoken',
            },
          }),
        }),
      });

      await expect(
        jwtAuthGuard.canActivate(mockExecutionContext),
      ).rejects.toThrow(new UnauthorizedException('Token mal formatado'));
    });

    it('should throw UnauthorizedException when the token is not sent', async () => {
      const mockExecutionContext = createMock<ExecutionContext>({
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {
              authorization: 'Bearer',
            },
          }),
        }),
      });

      await expect(
        jwtAuthGuard.canActivate(mockExecutionContext),
      ).rejects.toThrow(new UnauthorizedException('Token não enviado'));
    });

    it('should throw UnauthorizedException when user from token not found', async () => {
      mockAuthService.extractUserFromToken.mockRejectedValueOnce(
        new UnauthorizedException('Não autorizado'),
      );
      const mockExecutionContext = createMock<ExecutionContext>({
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {
              authorization: 'Bearer invalid-token',
            },
          }),
        }),
      });

      await expect(
        jwtAuthGuard.canActivate(mockExecutionContext),
      ).rejects.toThrow(new UnauthorizedException('Não autorizado'));
    });

    it('should allow access with a valid token', async () => {
      mockAuthService.extractUserFromToken.mockResolvedValueOnce(
        mockUserEntity,
      );
      const mockExecutionContext = createMock<ExecutionContext>({
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {
              authorization: 'Bearer Token',
            },
          }),
        }),
      });
      const result = await jwtAuthGuard.canActivate(mockExecutionContext);

      expect(mockAuthService.extractUserFromToken).toHaveBeenCalledWith(
        'Token',
      );
      expect(result).toBe(true);
    });
  });
});
