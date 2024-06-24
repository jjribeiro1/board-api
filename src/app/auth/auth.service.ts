import { Injectable, UnauthorizedException } from '@nestjs/common';
import {
  JwtService,
  JwtSignOptions,
  JwtVerifyOptions,
  TokenExpiredError,
} from '@nestjs/jwt';
import { UsersRepository } from 'src/app/users/users.repository';
import { CryptoService } from 'src/app/crypto/crypto.service';
import { SignInDto } from './dto/sign-in.dto';
import { User } from 'src/app/users/entities/user.entity';
import { JwtUserPayload } from 'src/common/types/jwt-payload';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersRepository: UsersRepository,
    private readonly cryptoService: CryptoService,
  ) {}

  async signIn(dto: SignInDto) {
    const { email, password } = dto;
    const user = await this.validateUser(email, password);

    const accessToken = await this.generateToken({
      sub: user.id,
      email: user.email,
    });

    return {
      accessToken: accessToken,
    };
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersRepository.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Email e/ou senha incorretos');
    }

    const passwordIsValid = await this.cryptoService.compareHash(
      password,
      user.password,
    );

    if (!passwordIsValid) {
      throw new UnauthorizedException('Email e/ou senha incorretos');
    }

    return new User(
      user.id,
      user.name,
      user.email,
      user.password,
      user.createdAt,
      user.updatedAt,
    );
  }

  async extractUserFromToken(token: string) {
    const payload: JwtUserPayload = await this.verifyToken(token);
    const user = await this.usersRepository.findOne(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Não autorizado');
    }
    return user;
  }

  private async generateToken(payload: any, options?: JwtSignOptions) {
    try {
      const token = await this.jwtService.signAsync(payload, options);
      return token;
    } catch (error) {
      console.error(error);
      throw new UnauthorizedException('Não foi possível gerar token de acesso');
    }
  }

  private async verifyToken(token: string, options?: JwtVerifyOptions) {
    try {
      const payload = await this.jwtService.verifyAsync(token, options);
      return payload;
    } catch (error) {
      console.error(error);
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException('Token expirado');
      }
      throw new UnauthorizedException('Erro ao verificar token');
    }
  }
}
