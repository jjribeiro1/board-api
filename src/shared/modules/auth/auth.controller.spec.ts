import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { SignInDto } from './dto/sign-in.dto';
import { Response, Request } from 'express';
import { COOKIE_ACCESS_TOKEN_EXPIRES_IN, COOKIE_REFRESH_TOKEN_EXPIRES_IN } from 'src/constants';
import { createMockUser } from 'test/factories/user-payload-factory';

describe('AuthController', () => {
  let controller: AuthController;
  let authServiceMock: DeepMockProxy<AuthService>;
  let mockResponse: DeepMockProxy<Response>;
  let mockRequest: DeepMockProxy<Request & { user?: any }>;

  beforeEach(async () => {
    authServiceMock = mockDeep<AuthService>();
    mockResponse = mockDeep<Response>();
    mockRequest = mockDeep<Request & { user?: any }>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('signIn', () => {
    it('should sign in a user and set cookies with tokens', async () => {
      const dto: SignInDto = {
        email: 'email@example.com',
        password: 'password123',
      };
      const expectedAccessToken = 'mock-access-token';
      const expectedRefreshToken = 'mock-refresh-token';

      authServiceMock.signIn.mockResolvedValue({
        accessToken: expectedAccessToken,
        refreshToken: expectedRefreshToken,
      });

      await controller.signIn(mockResponse, dto);

      expect(authServiceMock.signIn).toHaveBeenCalledWith(dto);

      expect(mockResponse.cookie).toHaveBeenCalledWith('access-token', expectedAccessToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'none',
        maxAge: COOKIE_ACCESS_TOKEN_EXPIRES_IN,
      });

      expect(mockResponse.cookie).toHaveBeenCalledWith('refresh-token', expectedRefreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'none',
        maxAge: COOKIE_REFRESH_TOKEN_EXPIRES_IN,
      });
    });

    it('should set secure cookies when in production environment', async () => {
      const dto: SignInDto = {
        email: 'email@example.com',
        password: 'password123',
      };
      const expectedAccessToken = 'mock-access-token';
      const expectedRefreshToken = 'mock-refresh-token';

      authServiceMock.signIn.mockResolvedValue({
        accessToken: expectedAccessToken,
        refreshToken: expectedRefreshToken,
      });

      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      await controller.signIn(mockResponse, dto);

      expect(mockResponse.cookie).toHaveBeenCalledWith('access-token', expectedAccessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: COOKIE_ACCESS_TOKEN_EXPIRES_IN,
      });

      expect(mockResponse.cookie).toHaveBeenCalledWith('refresh-token', expectedRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: COOKIE_REFRESH_TOKEN_EXPIRES_IN,
      });

      process.env.NODE_ENV = originalEnv;
    });

    it('should throw an error if authService.signIn fails', async () => {
      const dto: SignInDto = {
        email: 'email@example.com',
        password: 'password123',
      };

      authServiceMock.signIn.mockRejectedValue(new Error());

      await expect(controller.signIn(mockResponse, dto)).rejects.toThrow();

      expect(mockResponse.cookie).not.toHaveBeenCalled();
    });
  });

  describe('refresh', () => {
    it('should refresh tokens and set new cookies', async () => {
      const oldRefreshToken = 'old-refresh-token';
      const newAccessToken = 'new-access-token';
      const newRefreshToken = 'new-refresh-token';

      mockRequest.cookies = { 'refresh-token': oldRefreshToken };

      authServiceMock.refreshToken.mockResolvedValue({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });

      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const result = await controller.refresh(mockRequest, mockResponse);

      expect(authServiceMock.refreshToken).toHaveBeenCalledWith(oldRefreshToken);

      expect(mockResponse.cookie).toHaveBeenCalledWith('access-token', newAccessToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'none',
        maxAge: COOKIE_ACCESS_TOKEN_EXPIRES_IN,
      });

      expect(mockResponse.cookie).toHaveBeenCalledWith('refresh-token', newRefreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'none',
        maxAge: COOKIE_REFRESH_TOKEN_EXPIRES_IN,
      });

      expect(result).toEqual({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });

      process.env.NODE_ENV = originalEnv;
    });

    it('should set secure cookies when in production environment', async () => {
      const oldRefreshToken = 'old-refresh-token';
      const newAccessToken = 'new-access-token';
      const newRefreshToken = 'new-refresh-token';

      mockRequest.cookies = { 'refresh-token': oldRefreshToken };

      authServiceMock.refreshToken.mockResolvedValue({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });

      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      await controller.refresh(mockRequest, mockResponse);

      expect(mockResponse.cookie).toHaveBeenCalledWith('access-token', newAccessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: COOKIE_ACCESS_TOKEN_EXPIRES_IN,
      });

      expect(mockResponse.cookie).toHaveBeenCalledWith('refresh-token', newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: COOKIE_REFRESH_TOKEN_EXPIRES_IN,
      });

      process.env.NODE_ENV = originalEnv;
    });

    it('should throw an error if authService.refreshToken fails', async () => {
      const oldRefreshToken = 'old-refresh-token';

      mockRequest.cookies = { 'refresh-token': oldRefreshToken };

      authServiceMock.refreshToken.mockRejectedValue(new Error());

      await expect(controller.refresh(mockRequest, mockResponse)).rejects.toThrow();

      expect(mockResponse.cookie).not.toHaveBeenCalled();
    });
  });

  describe('getProfile', () => {
    it('should return the logged user profile from request', () => {
      const mockUser = createMockUser();
      mockRequest.user = mockUser;

      const result = controller.getProfile(mockRequest);

      expect(result).toEqual(mockUser);
    });
  });

  describe('signOut', () => {
    it('should clear cookies and call authService.logout', async () => {
      const mockUser = createMockUser();
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.CLIENT_DOMAIN,
      };

      authServiceMock.logout.mockResolvedValue(undefined);

      await controller.signOut(mockResponse, mockUser);

      expect(mockResponse.clearCookie).toHaveBeenCalledWith('access-token', { ...cookieOptions, sameSite: 'none' });
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('refresh-token', { ...cookieOptions, sameSite: 'none' });
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('org-id', { ...cookieOptions, sameSite: 'none' });

      expect(authServiceMock.logout).toHaveBeenCalledWith(mockUser.id);
    });

    it('should throw an error if authService.logout fails', async () => {
      const mockUser = createMockUser();
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.CLIENT_DOMAIN,
      };

      authServiceMock.logout.mockRejectedValue(new Error());

      await expect(controller.signOut(mockResponse, mockUser)).rejects.toThrow();

      expect(mockResponse.clearCookie).toHaveBeenCalledWith('access-token', { ...cookieOptions, sameSite: 'none' });
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('refresh-token', { ...cookieOptions, sameSite: 'none' });
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('org-id', { ...cookieOptions, sameSite: 'none' });
    });
  });
});
