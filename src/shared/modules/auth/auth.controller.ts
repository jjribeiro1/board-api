import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SignInDto } from './dto/sign-in.dto';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { COOKIE_ACCESS_TOKEN_EXPIRES_IN, COOKIE_REFRESH_TOKEN_EXPIRES_IN } from 'src/constants';
import { Public } from 'src/common/decorators/is-public.decorator';
import { LoggedUser } from 'src/common/decorators/logged-user.decorator';
import { User } from 'src/modules/users/entities/user.entity';
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

    res.cookie('access-token', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: COOKIE_ACCESS_TOKEN_EXPIRES_IN - 10,
    });

    res.cookie('refresh-token', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: COOKIE_REFRESH_TOKEN_EXPIRES_IN,
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

    res.cookie('access-token', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: COOKIE_ACCESS_TOKEN_EXPIRES_IN,
    });

    res.cookie('refresh-token', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: COOKIE_REFRESH_TOKEN_EXPIRES_IN,
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
  async signOut(@Res({ passthrough: true }) res: Response, @LoggedUser() user: User) {
    res.clearCookie('access-token');
    res.clearCookie('refresh-token');
    res.clearCookie('org-id');
    return this.authService.logout(user.id);
  }
}
