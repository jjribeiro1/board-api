import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SignInDto } from './dto/sign-in.dto';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { COOKIE_ACCESS_TOKEN_EXPIRES_IN, COOKIE_REFRESH_TOKEN_EXPIRES_IN } from 'src/constants';
import { Public } from 'src/common/decorators/is-public.decorator';
import { LoggedUser } from 'src/common/decorators/logged-user.decorator';
import { UserPayload } from 'src/common/types/user-payload';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   *
   * Generate jwt access and refresh token
   */
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('sign-in')
  async signIn(@Res({ passthrough: true }) res: Response, @Body() dto: SignInDto) {
    const { accessToken, refreshToken } = await this.authService.signIn(dto);
    const isProduction = process.env.NODE_ENV === 'production';
    const clientDomain = process.env.CLIENT_DOMAIN;

    res.cookie('access-token', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'none',
      maxAge: COOKIE_ACCESS_TOKEN_EXPIRES_IN,
      domain: clientDomain,
    });

    res.cookie('refresh-token', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'none',
      maxAge: COOKIE_REFRESH_TOKEN_EXPIRES_IN,
      domain: clientDomain,
    });

    return;
  }

  /**
   *
   * Endpoint to generate new access token
   */
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken } = await this.authService.refreshToken(req.cookies['refresh-token']);
    const isProduction = process.env.NODE_ENV === 'production';
    const clientDomain = process.env.CLIENT_DOMAIN;

    res.cookie('access-token', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'none',
      maxAge: COOKIE_ACCESS_TOKEN_EXPIRES_IN,
      domain: clientDomain,
    });

    res.cookie('refresh-token', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'none',
      maxAge: COOKIE_REFRESH_TOKEN_EXPIRES_IN,
      domain: clientDomain,
    });

    return { accessToken, refreshToken };
  }

  /**
   *
   * Returns logged user profile
   */
  @ApiBearerAuth()
  @Get('/me')
  getProfile(@Req() req) {
    return req.user;
  }

  /**
   *
   * Endpoint to sign out user
   */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('sign-out')
  @HttpCode(HttpStatus.OK)
  async signOut(@Res({ passthrough: true }) res: Response, @LoggedUser() user: UserPayload) {
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      domain: process.env.CLIENT_DOMAIN,
    };

    res.clearCookie('access-token', { ...cookieOptions, sameSite: 'none' });
    res.clearCookie('refresh-token', { ...cookieOptions, sameSite: 'none' });
    res.clearCookie('org-id', { ...cookieOptions, sameSite: 'none' });
    return this.authService.logout(user.id);
  }
}
