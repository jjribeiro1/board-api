import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService, JwtSignOptions, JwtVerifyOptions, TokenExpiredError } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SignInDto } from './dto/sign-in.dto';
import { UsersRepository } from 'src/modules/users/users.repository';
import { JwtUserPayload } from 'src/common/types/jwt-payload';
import { ACCESS_TOKEN_EXPIRES_IN, REFRESH_TOKEN_EXPIRES_IN } from 'src/constants';
import { PrismaService } from '../database/prisma/prisma.service';
import dayjs from '../../../utils/dayjs';
import { compareHash } from 'src/utils/hasher';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersRepository: UsersRepository,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async signIn(dto: SignInDto) {
    const { email, password } = dto;
    const user = await this.validateUser(email, password);
    const tokenPayload = {
      sub: user.id,
      organizations: user.organizations,
    };
    const accessToken = await this.generateToken(tokenPayload, {
      privateKey: this.configService.get('ACCESS_TOKEN_PRIVATE_KEY'),
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    });
    const refreshToken = await this.generateToken(tokenPayload, {
      privateKey: this.configService.get('REFRESH_TOKEN_PRIVATE_KEY'),
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    });

    await this.createSession(refreshToken, user.id);

    return {
      accessToken,
      refreshToken,
    };
  }

  async logout(userId: string) {
    await this.prisma.session.deleteMany({
      where: {
        userId,
      },
    });
  }

  async refreshToken(token: string) {
    await this.verifyToken(token, {
      publicKey: this.configService.get<string>('REFRESH_TOKEN_PUBLIC_KEY'),
    });
    const { session, user } = await this.getSession(token);

    if (!session || session.expiresAt < new Date()) {
      await this.prisma.session.delete({ where: { refreshToken: token } });
      throw new UnauthorizedException('Sessão inválida ou expirada');
    }

    const tokenPayload = {
      sub: user.id,
      organizations: user.organizations,
    };
    const accessToken = await this.generateToken(tokenPayload, {
      privateKey: this.configService.get('ACCESS_TOKEN_PRIVATE_KEY'),
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    });
    const refreshToken = await this.generateToken(tokenPayload, {
      privateKey: this.configService.get('REFRESH_TOKEN_PRIVATE_KEY'),
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    });

    await this.prisma.session.update({
      where: { id: session.id, userId: user.id },
      data: { refreshToken, expiresAt: dayjs().add(REFRESH_TOKEN_EXPIRES_IN, 'seconds').toDate() },
    });

    return { accessToken, refreshToken };
  }

  async extractUserFromAccessToken(token: string) {
    const payload: JwtUserPayload = await this.verifyToken(token, {
      publicKey: this.configService.get<string>('ACCESS_TOKEN_PUBLIC_KEY'),
    });
    const session = await this.prisma.session.findFirst({
      where: { userId: payload.sub },
      orderBy: { createdAt: 'desc' },
    });
    if (!session || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Sessão inválida ou expirada');
    }
    const user = await this.usersRepository.findOne(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Não autorizado');
    }

    return user;
  }

  private async validateUser(email: string, password: string) {
    const user = await this.usersRepository.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Email e/ou senha incorretos');
    }

    const passwordIsValid = await compareHash(password, user.password);

    if (!passwordIsValid) {
      throw new UnauthorizedException('Email e/ou senha incorretos');
    }

    return user;
  }

  private async createSession(token: string, userId: string) {
    await this.prisma.session.create({
      data: {
        userId,
        refreshToken: token,
        expiresAt: dayjs().add(REFRESH_TOKEN_EXPIRES_IN, 'seconds').toDate(),
      },
    });
  }

  private async getSession(token: string) {
    const session = await this.prisma.session.findUnique({
      where: { refreshToken: token },
      select: {
        id: true,
        refreshToken: true,
        expiresAt: true,
        device: true,
        ipAddress: true,
        userAgent: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            organizations: {
              select: {
                organizationId: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!session) {
      throw new UnauthorizedException('Sessão inválida');
    }

    return { session, user: session.user };
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
