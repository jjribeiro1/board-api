import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { AuthService } from '../auth.service';
import { IS_PUBLIC_KEY } from 'src/common/decorators/is-public.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private reflector: Reflector,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [ctx.getHandler(), ctx.getClass()]);
    if (isPublic) {
      return true;
    }

    const req: Request = ctx.switchToHttp().getRequest();
    const token = this.extractTokenFromCookie(req);
    const user = await this.authService.extractUserFromToken(token);
    req['user'] = user.toPresentation();
    return true;
  }

  private extractTokenFromCookie(req: Request) {
    if (req.cookies && 'access-token' in req.cookies) {
      return req.cookies['access-token'];
    }

    throw new UnauthorizedException('Token de acesso inválido ou não foi enviado');
  }
}
