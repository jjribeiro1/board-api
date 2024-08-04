import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req: Request = ctx.switchToHttp().getRequest();
    const token = this.extractTokenFromAuthorizationHeader(req);
    const user = await this.authService.extractUserFromToken(token);

    req['user'] = user.toPresentation();
    return true;
  }

  private extractTokenFromAuthorizationHeader(req: Request) {
    if (!req.headers.authorization) {
      throw new UnauthorizedException('Authorization header inválido');
    }

    const [type, token] = req.headers.authorization.split(' ') ?? [];

    if (type !== 'Bearer') {
      throw new UnauthorizedException('Token mal formatado');
    }

    if (!token) {
      throw new UnauthorizedException('Token não enviado');
    }

    return token;
  }
}
