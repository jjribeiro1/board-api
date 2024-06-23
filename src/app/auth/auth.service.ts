import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { UsersRepository } from 'src/app/users/users.repository';
import { CryptoService } from 'src/app/crypto/crypto.service';
import { SignInDto } from './dto/sign-in.dto';
import { User } from 'src/app/users/entities/user.entity';

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

  private async generateToken(payload: any, options?: JwtSignOptions) {
    try {
      const token = await this.jwtService.signAsync(payload, options);
      return token;
    } catch (error) {
      console.error(error);
      throw new UnauthorizedException('Não foi possível gerar token de acesso');
    }
  }
}
