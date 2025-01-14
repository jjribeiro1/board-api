import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService, JwtSignOptions, JwtVerifyOptions, TokenExpiredError } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SignInDto } from './dto/sign-in.dto';
import { UsersRepository } from 'src/modules/users/users.repository';
import { CryptoService } from 'src/shared/modules/crypto/crypto.service';
import { JwtUserPayload } from 'src/common/types/jwt-payload';
import { JWT_REFRESH_TOKEN_EXPIRES_IN, JWT_ACCESS_TOKEN_EXPIRES_IN } from 'src/constants';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersRepository: UsersRepository,
    private readonly cryptoService: CryptoService,
    private readonly configService: ConfigService,
  ) {}

  async signIn(dto: SignInDto) {
    const { email, password } = dto;
    const user = await this.validateUser(email, password);
    const tokenPayload = {
      sub: user.id,
      email: user.email,
    };

    const accessToken = await this.generateToken(tokenPayload, {
      privateKey: this.configService.get('ACCESS_TOKEN_PRIVATE_KEY'),
      expiresIn: JWT_ACCESS_TOKEN_EXPIRES_IN,
    });
    const refreshToken = await this.generateToken(tokenPayload, {
      privateKey: this.configService.get<string>('REFRESH_TOKEN_PRIVATE_KEY'),
      expiresIn: JWT_REFRESH_TOKEN_EXPIRES_IN,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersRepository.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Email e/ou senha incorretos');
    }

    const passwordIsValid = await this.cryptoService.compareHash(password, user.password);

    if (!passwordIsValid) {
      throw new UnauthorizedException('Email e/ou senha incorretos');
    }

    return user;
  }

  async extractUserFromToken(token: string) {
    const payload: JwtUserPayload = await this.verifyToken(token, {
      publicKey: this.configService.get<string>('ACCESS_TOKEN_PRIVATE_KEY'),
    });
    const user = await this.usersRepository.findOne(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Não autorizado');
    }
    return user;
  }

  async refreshToken(refresh: string) {
    if (!refresh) {
      throw new UnauthorizedException();
    }

    const refreshTokenPayload: JwtUserPayload = await this.verifyToken(refresh, {
      publicKey: this.configService.get('REFRESH_TOKEN_PUBLIC_KEY'),
    });

    const user = await this.usersRepository.findOne(refreshTokenPayload.sub);

    if (!user) {
      throw new UnauthorizedException('Não autorizado');
    }

    const newAccessToken = await this.generateToken(
      { sub: user.id, email: user.email },
      {
        privateKey: this.configService.get<string>('ACCESS_TOKEN_PRIVATE_KEY'),
        expiresIn: JWT_ACCESS_TOKEN_EXPIRES_IN,
      },
    );

    return newAccessToken;
  }

  private async generateToken(payload: any, options?: JwtSignOptions) {
    try {
      const token = await this.jwtService.signAsync(payload, options);
      return token;
    } catch (error) {
      throw new UnauthorizedException('Não foi possível gerar token de acesso');
    }
  }

  private async verifyToken(token: string, options?: JwtVerifyOptions) {
    try {
      const payload = await this.jwtService.verifyAsync(token, options);
      return payload;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException('Token expirado');
      }
      throw new UnauthorizedException('Erro ao verificar token');
    }
  }
}
