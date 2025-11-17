import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { UsersRepository } from 'src/modules/users/users.repository';
import { PrismaService } from '../database/prisma/prisma.service';
import { SignInDto } from './dto/sign-in.dto';
import * as hashUtils from 'src/utils/hasher';
import { createMockUser } from 'test/factories/user-payload-factory';
import { UnauthorizedException } from '@nestjs/common';
import { ACCESS_TOKEN_EXPIRES_IN, REFRESH_TOKEN_EXPIRES_IN } from 'src/constants';

describe('AuthService', () => {
  let service: AuthService;
  let jwtServiceMock: DeepMockProxy<JwtService>;
  let usersRepositoryMock: DeepMockProxy<UsersRepository>;
  let configServiceMock: DeepMockProxy<ConfigService>;
  let prismaServiceMock: DeepMockProxy<PrismaService>;

  beforeEach(async () => {
    jwtServiceMock = mockDeep<JwtService>();
    usersRepositoryMock = mockDeep<UsersRepository>();
    configServiceMock = mockDeep<ConfigService>();
    prismaServiceMock = mockDeep<PrismaService>();

    configServiceMock.get.mockImplementation((key: string) => {
      const config = {
        ACCESS_TOKEN_PRIVATE_KEY: 'access-private-key',
        REFRESH_TOKEN_PRIVATE_KEY: 'refresh-private-key',
        ACCESS_TOKEN_PUBLIC_KEY: 'access-public-key',
        REFRESH_TOKEN_PUBLIC_KEY: 'refresh-public-key',
      };
      return config[key];
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
        {
          provide: UsersRepository,
          useValue: usersRepositoryMock,
        },
        {
          provide: ConfigService,
          useValue: configServiceMock,
        },
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('signIn', () => {
    it('should sign in a user and return an access token and refresh token', async () => {
      const dto: SignInDto = {
        email: 'email@example.com',
        password: 'password123',
      };
      const mockUser = createMockUser();
      const expectedAccessToken = 'mock-access-token';
      const expectedRefreshToken = 'mock-refresh-token';
      const tokenPayload = {
        sub: mockUser.id,
        organizations: mockUser.organizations,
      };

      usersRepositoryMock.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(hashUtils, 'compareHash').mockResolvedValueOnce(true);

      jwtServiceMock.signAsync.mockResolvedValueOnce(expectedAccessToken).mockResolvedValueOnce(expectedRefreshToken);
      prismaServiceMock.session.create.mockResolvedValue({} as any);

      const result = await service.signIn(dto);

      expect(jwtServiceMock.signAsync).toHaveBeenCalledWith(tokenPayload, {
        privateKey: 'access-private-key',
        expiresIn: ACCESS_TOKEN_EXPIRES_IN,
      });

      expect(jwtServiceMock.signAsync).toHaveBeenCalledWith(tokenPayload, {
        privateKey: 'refresh-private-key',
        expiresIn: REFRESH_TOKEN_EXPIRES_IN,
      });

      expect(prismaServiceMock.session.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: mockUser.id,
          refreshToken: expectedRefreshToken,
          expiresAt: expect.any(Date),
        }),
      });

      expect(result).toEqual({
        accessToken: expectedAccessToken,
        refreshToken: expectedRefreshToken,
      });
    });

    it('should throw an error if user is not found', async () => {
      const dto: SignInDto = {
        email: 'email@example.com',
        password: 'password123',
      };
      usersRepositoryMock.findByEmail.mockResolvedValue(null);

      const errorMessage = 'Email e/ou senha incorretos';

      await expect(service.signIn(dto)).rejects.toThrow(new UnauthorizedException(errorMessage));
    });

    it('should throw an error if user password is incorrect', async () => {
      const dto: SignInDto = {
        email: 'email@example.com',
        password: 'password123',
      };
      const mockUser = createMockUser();

      usersRepositoryMock.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(hashUtils, 'compareHash').mockResolvedValueOnce(false);

      const errorMessage = 'Email e/ou senha incorretos';

      await expect(service.signIn(dto)).rejects.toThrow(new UnauthorizedException(errorMessage));
    });

    it('should throw an error if token generation fails', async () => {
      const dto: SignInDto = {
        email: 'email@example.com',
        password: 'password123',
      };
      const mockUser = createMockUser();

      usersRepositoryMock.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(hashUtils, 'compareHash').mockResolvedValueOnce(true);
      jwtServiceMock.signAsync.mockRejectedValueOnce(new Error());

      await expect(service.signIn(dto)).rejects.toThrow(
        new UnauthorizedException('Não foi possível gerar token de acesso'),
      );

      expect(prismaServiceMock.session.create).not.toHaveBeenCalled();
    });

    it('should throw an error if createSession fails', async () => {
      const dto: SignInDto = {
        email: 'email@example.com',
        password: 'password123',
      };
      const mockUser = createMockUser();

      usersRepositoryMock.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(hashUtils, 'compareHash').mockResolvedValueOnce(true);
      jwtServiceMock.signAsync.mockResolvedValueOnce('mock-access-token').mockResolvedValueOnce('mock-refresh-token');
      prismaServiceMock.session.create.mockRejectedValueOnce(new Error());

      await expect(service.signIn(dto)).rejects.toThrow();
    });
  });

  describe('logout', () => {
    it('should delete all user sessions', async () => {
      const userId = 'user-id-1';

      prismaServiceMock.session.deleteMany.mockResolvedValue({ count: 1 });

      await service.logout(userId);

      expect(prismaServiceMock.session.deleteMany).toHaveBeenCalledWith({
        where: { userId },
      });
    });
  });

  describe('refreshToken', () => {
    it('should refresh tokens and return new access and refresh tokens', async () => {
      const token = 'valid-refresh-token';
      const mockUser = createMockUser();
      const mockSession = {
        id: 'session-id-1',
        refreshToken: token,
        expiresAt: new Date(Date.now() + 1000000),
        device: null,
        ipAddress: null,
        userAgent: null,
        userId: mockUser.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        user: {
          ...mockUser,
          organizations: mockUser.organizations.map((org) => ({
            organizationId: org.id,
            role: org.role,
          })),
        },
      };
      const expectedAccessToken = 'new-access-token';
      const expectedRefreshToken = 'new-refresh-token';
      const tokenPayload = {
        sub: mockUser.id,
        organizations: mockSession.user.organizations,
      };

      jwtServiceMock.verifyAsync.mockResolvedValueOnce({ sub: mockUser.id });
      prismaServiceMock.session.findUnique.mockResolvedValue(mockSession);
      jwtServiceMock.signAsync.mockResolvedValueOnce(expectedAccessToken).mockResolvedValueOnce(expectedRefreshToken);
      prismaServiceMock.session.update.mockResolvedValue({} as any);

      const result = await service.refreshToken(token);

      expect(jwtServiceMock.verifyAsync).toHaveBeenCalledWith(token, {
        publicKey: configServiceMock.get('REFRESH_TOKEN_PUBLIC_KEY'),
      });

      expect(prismaServiceMock.session.findUnique).toHaveBeenCalledWith({
        where: { refreshToken: token },
        select: expect.any(Object),
      });

      expect(jwtServiceMock.signAsync).toHaveBeenCalledWith(tokenPayload, {
        privateKey: 'access-private-key',
        expiresIn: ACCESS_TOKEN_EXPIRES_IN,
      });

      expect(jwtServiceMock.signAsync).toHaveBeenCalledWith(tokenPayload, {
        privateKey: 'refresh-private-key',
        expiresIn: REFRESH_TOKEN_EXPIRES_IN,
      });

      expect(prismaServiceMock.session.update).toHaveBeenCalledWith({
        where: { id: mockSession.id, userId: mockUser.id },
        data: {
          refreshToken: expectedRefreshToken,
          expiresAt: expect.any(Date),
        },
      });

      expect(result).toEqual({
        accessToken: expectedAccessToken,
        refreshToken: expectedRefreshToken,
      });
    });

    it('should throw an error if token verification fails', async () => {
      const token = 'invalid-token';

      jwtServiceMock.verifyAsync.mockRejectedValueOnce(new Error());

      await expect(service.refreshToken(token)).rejects.toThrow(new UnauthorizedException('Erro ao verificar token'));
    });

    it('should throw an error if session is not found', async () => {
      const token = 'refresh-token';

      jwtServiceMock.verifyAsync.mockResolvedValueOnce({ sub: 'user-id-1' });
      prismaServiceMock.session.findUnique.mockResolvedValue(null);

      await expect(service.refreshToken(token)).rejects.toThrow(new UnauthorizedException('Sessão inválida'));

      expect(jwtServiceMock.signAsync).not.toHaveBeenCalled();
      expect(prismaServiceMock.session.update).not.toHaveBeenCalled();
    });

    it('should throw an error if session is expired', async () => {
      const token = 'valid-refresh-token';
      const mockUser = createMockUser();
      const expiredSession = {
        id: 'session-id-1',
        refreshToken: token,
        expiresAt: new Date(Date.now() - 1000),
        device: null,
        ipAddress: null,
        userAgent: null,
        userId: mockUser.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        user: {
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          organizations: mockUser.organizations.map((org) => ({
            organizationId: org.id,
            role: org.role,
          })),
        },
      };

      jwtServiceMock.verifyAsync.mockResolvedValueOnce({ sub: mockUser.id });
      prismaServiceMock.session.findUnique.mockResolvedValue(expiredSession);
      prismaServiceMock.session.delete.mockResolvedValue({} as any);

      await expect(service.refreshToken(token)).rejects.toThrow(
        new UnauthorizedException('Sessão inválida ou expirada'),
      );

      expect(prismaServiceMock.session.delete).toHaveBeenCalledWith({
        where: { refreshToken: token },
      });
    });
  });

  describe('extractUserFromAccessToken', () => {
    it('should extract and return user from valid access token', async () => {
      const token = 'valid-access-token';
      const mockUser = createMockUser();
      const mockSession = {
        id: 'session-id-1',
        userId: mockUser.id,
        expiresAt: new Date(Date.now() + 1000000),
        createdAt: new Date(),
      };

      jwtServiceMock.verifyAsync.mockResolvedValueOnce({ sub: mockUser.id });
      prismaServiceMock.session.findFirst.mockResolvedValue(mockSession as any);
      usersRepositoryMock.findOne.mockResolvedValue(mockUser);

      const result = await service.extractUserFromAccessToken(token);

      expect(jwtServiceMock.verifyAsync).toHaveBeenCalledWith(token, {
        publicKey: configServiceMock.get('ACCESS_TOKEN_PUBLIC_KEY'),
      });

      expect(prismaServiceMock.session.findFirst).toHaveBeenCalledWith({
        where: { userId: mockUser.id },
        orderBy: { createdAt: 'desc' },
      });

      expect(usersRepositoryMock.findOne).toHaveBeenCalledWith(mockUser.id);

      expect(result).toEqual(mockUser);
    });

    it('should throw an error if token verification fails', async () => {
      const token = 'invalid-token';

      jwtServiceMock.verifyAsync.mockRejectedValueOnce(new Error());

      await expect(service.extractUserFromAccessToken(token)).rejects.toThrow(
        new UnauthorizedException('Erro ao verificar token'),
      );
    });

    it('should throw an error if session is not found', async () => {
      const token = 'valid-access-token';

      jwtServiceMock.verifyAsync.mockResolvedValueOnce({ sub: 'user-id-1' });
      prismaServiceMock.session.findFirst.mockResolvedValue(null);

      await expect(service.extractUserFromAccessToken(token)).rejects.toThrow(
        new UnauthorizedException('Sessão inválida ou expirada'),
      );
    });

    it('should throw an error if session is expired', async () => {
      const token = 'valid-access-token';
      const expiredSession = {
        id: 'session-id-1',
        userId: 'user-id-1',
        expiresAt: new Date(Date.now() - 1000),
        createdAt: new Date(),
      };

      jwtServiceMock.verifyAsync.mockResolvedValueOnce({ sub: 'user-id-1' });
      prismaServiceMock.session.findFirst.mockResolvedValue(expiredSession as any);

      await expect(service.extractUserFromAccessToken(token)).rejects.toThrow(
        new UnauthorizedException('Sessão inválida ou expirada'),
      );
    });

    it('should throw an error if user is not found', async () => {
      const token = 'valid-access-token';
      const mockSession = {
        id: 'session-id-1',
        userId: 'user-id-1',
        expiresAt: new Date(Date.now() + 1000000),
        createdAt: new Date(),
      };

      jwtServiceMock.verifyAsync.mockResolvedValueOnce({ sub: 'user-id-1' });
      prismaServiceMock.session.findFirst.mockResolvedValue(mockSession as any);
      usersRepositoryMock.findOne.mockResolvedValue(null);

      await expect(service.extractUserFromAccessToken(token)).rejects.toThrow(
        new UnauthorizedException('Não autorizado'),
      );
    });
  });
});
