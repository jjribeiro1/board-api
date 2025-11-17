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
});
