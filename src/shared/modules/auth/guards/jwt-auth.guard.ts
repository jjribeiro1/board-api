import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
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
