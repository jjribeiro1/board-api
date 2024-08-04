import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { mockAuthService, mockSignInDto } from 'test/mocks/auth';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('signIn', () => {
    it('should call AuthService with correct values', async () => {
      await controller.signIn(mockSignInDto);
      expect(mockAuthService.signIn).toHaveBeenCalledWith(mockSignInDto);
    });

    it('should return an access token', async () => {
      mockAuthService.signIn.mockResolvedValueOnce({
        accessToken: 'jwt-token',
      });

      const result = await controller.signIn(mockSignInDto);
      expect(result).toEqual({ accessToken: 'jwt-token' });
    });

    it('should throw if AuthService throws', async () => {
      mockAuthService.signIn.mockRejectedValueOnce(new UnauthorizedException());

      await expect(controller.signIn(mockSignInDto)).rejects.toThrow(new UnauthorizedException());
    });
  });
});
