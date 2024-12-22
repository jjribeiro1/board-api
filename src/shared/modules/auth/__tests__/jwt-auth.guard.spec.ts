import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AuthService } from '../auth.service';
import { mockAuthService } from 'test/mocks/auth';
import { mockUserEntity } from 'test/mocks/user';

describe('JwtAuthGuard', () => {
  let jwtAuthGuard: JwtAuthGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtAuthGuard, { provide: AuthService, useValue: mockAuthService }],
    }).compile();

    jwtAuthGuard = module.get<JwtAuthGuard>(JwtAuthGuard);
  });

  describe('canActivate', () => {
    it('should throw UnauthorizedException when the token is not sent', async () => {
      const mockExecutionContext = createMock<ExecutionContext>({
        switchToHttp: () => ({
          getRequest: () => ({
            cookies: {},
          }),
        }),
      });

      await expect(jwtAuthGuard.canActivate(mockExecutionContext)).rejects.toThrow(
        new UnauthorizedException('Token de acesso inválido ou não foi enviado'),
      );
    });

    it('should throw UnauthorizedException when user from token not found', async () => {
      mockAuthService.extractUserFromToken.mockRejectedValueOnce(new UnauthorizedException('Não autorizado'));
      const mockExecutionContext = createMock<ExecutionContext>({
        switchToHttp: () => ({
          getRequest: () => ({
            cookies: {
              'access-token': 'Token',
            },
          }),
        }),
      });

      await expect(jwtAuthGuard.canActivate(mockExecutionContext)).rejects.toThrow(
        new UnauthorizedException('Não autorizado'),
      );
    });

    it('should allow access with a valid token', async () => {
      mockAuthService.extractUserFromToken.mockResolvedValueOnce(mockUserEntity);
      const mockExecutionContext = createMock<ExecutionContext>({
        switchToHttp: () => ({
          getRequest: () => ({
            cookies: {
              'access-token': 'Token',
            },
          }),
        }),
      });
      const result = await jwtAuthGuard.canActivate(mockExecutionContext);
      expect(mockAuthService.extractUserFromToken).toHaveBeenCalledWith('Token');
      expect(result).toBe(true);
    });
  });
});
