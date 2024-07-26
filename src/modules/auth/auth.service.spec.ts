import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersRepository } from 'src/modules/users/users.repository';
import { CryptoService } from 'src/modules/crypto/crypto.service';
import { mockJwtService } from 'test/mocks/auth';
import { mockUserEntity, mockUsersRepository } from 'test/mocks/user';
import { mockCryptoService } from 'test/mocks/crypto';
import { mockSignInDto } from 'test/mocks/auth';
import { JwtUserPayload } from 'src/common/types/jwt-payload';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: UsersRepository, useValue: mockUsersRepository },
        { provide: CryptoService, useValue: mockCryptoService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signIn', () => {
    it('should throw UnauthorizedException if user not exists', async () => {
      mockUsersRepository.findByEmail.mockResolvedValueOnce(null);

      await expect(authService.signIn(mockSignInDto)).rejects.toThrow(
        new UnauthorizedException('Email e/ou senha incorretos'),
      );
    });

    it('should throw UnauthorizedException if user password is invalid', async () => {
      mockUsersRepository.findByEmail.mockResolvedValueOnce(mockUserEntity);
      mockCryptoService.compareHash.mockResolvedValueOnce(false);

      await expect(authService.signIn(mockSignInDto)).rejects.toThrow(
        new UnauthorizedException('Email e/ou senha incorretos'),
      );
    });

    it('should throw UnauthorizedException if generateToken fails', async () => {
      mockUsersRepository.findByEmail.mockResolvedValueOnce(mockUserEntity);
      mockCryptoService.compareHash.mockResolvedValueOnce(true);
      mockJwtService.signAsync.mockRejectedValueOnce(new Error('error'));

      await expect(authService.signIn(mockSignInDto)).rejects.toThrow(
        new UnauthorizedException('Não foi possível gerar token de acesso'),
      );
    });

    it('should generate and returns an jwt access token', async () => {
      mockUsersRepository.findByEmail.mockResolvedValueOnce(mockUserEntity);
      mockCryptoService.compareHash.mockResolvedValueOnce(true);
      mockJwtService.signAsync.mockResolvedValueOnce('jwt-token');

      const payload = { sub: mockUserEntity.id, email: mockUserEntity.email };
      const result = await authService.signIn(mockSignInDto);

      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(1);
      expect(mockJwtService.signAsync).toHaveBeenCalledWith(payload, undefined);
      expect(result).toEqual({ accessToken: 'jwt-token' });
    });
  });

  describe('validateUser', () => {
    it('should throw UnauthorizedException if user email not exists', async () => {
      mockUsersRepository.findByEmail.mockResolvedValueOnce(null);

      await expect(
        authService.validateUser(mockSignInDto.email, mockSignInDto.password),
      ).rejects.toThrow(
        new UnauthorizedException('Email e/ou senha incorretos'),
      );
    });

    it('should throw UnauthorizedException if user password is invalid', async () => {
      mockUsersRepository.findByEmail.mockResolvedValueOnce(mockUserEntity);
      mockCryptoService.compareHash.mockResolvedValueOnce(false);

      await expect(
        authService.validateUser(mockSignInDto.email, mockSignInDto.password),
      ).rejects.toThrow(
        new UnauthorizedException('Email e/ou senha incorretos'),
      );
      expect(mockCryptoService.compareHash).toHaveBeenCalledWith(
        mockSignInDto.password,
        mockUserEntity.password,
      );
    });

    it('should return the user if it is valid', async () => {
      mockUsersRepository.findByEmail.mockResolvedValueOnce(mockUserEntity);
      mockCryptoService.compareHash.mockResolvedValueOnce(true);

      const result = await authService.validateUser(
        mockSignInDto.email,
        mockSignInDto.password,
      );
      expect(result).toEqual(mockUserEntity);
    });
  });

  describe('extractUserFromToken', () => {
    it('should throw UnauthorizedException if verify token fails', async () => {
      mockJwtService.verifyAsync.mockRejectedValueOnce(
        new UnauthorizedException('Erro ao verificar token'),
      );

      await expect(
        authService.extractUserFromToken('any-token'),
      ).rejects.toThrow(new UnauthorizedException('Erro ao verificar token'));
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const payload: JwtUserPayload = { sub: 'any-id', email: 'any-email' };
      mockJwtService.verifyAsync.mockResolvedValueOnce(payload);
      mockUsersRepository.findOne.mockResolvedValueOnce(null);

      await expect(
        authService.extractUserFromToken('any-token'),
      ).rejects.toThrow(new UnauthorizedException('Não autorizado'));
      expect(mockUsersRepository.findOne).toHaveBeenCalledWith(payload.sub);
    });

    it('should return user from token', async () => {
      const payload: JwtUserPayload = { sub: 'any-id', email: 'any-email' };
      mockJwtService.verifyAsync.mockResolvedValueOnce(payload);
      mockUsersRepository.findOne.mockResolvedValueOnce(mockUserEntity);

      const result = await authService.extractUserFromToken('any-token');

      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(
        'any-token',
        undefined,
      );
      expect(mockUsersRepository.findOne).toHaveBeenCalledWith(payload.sub);
      expect(result).toEqual(mockUserEntity);
    });
  });
});
