import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';
import { Response } from 'express';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { mockAuthService, mockSignInDto } from 'test/mocks/auth';

const mockResponse = createMock<Response>({
  cookie: jest.fn(),
});

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
      mockAuthService.signIn.mockResolvedValueOnce({ accessToken: '', refreshToken: '' });
      await controller.signIn(mockResponse, mockSignInDto);
      expect(mockAuthService.signIn).toHaveBeenCalledWith(mockSignInDto);
    });

    it('should return an access token', async () => {
      mockAuthService.signIn.mockResolvedValueOnce({
        accessToken: 'jwt-access-token',
        refreshToken: 'jwt-refresh-token',
      });

      const result = await controller.signIn(mockResponse, mockSignInDto);
      expect(result).toEqual(undefined);
    });

    it('should throw if AuthService throws', async () => {
      mockAuthService.signIn.mockRejectedValueOnce(new UnauthorizedException());

      await expect(controller.signIn(mockResponse, mockSignInDto)).rejects.toThrow(new UnauthorizedException());
    });
  });
});
