import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SignInDto } from './dto/sign-in.dto';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Request, Response } from 'express';
import { COOKIE_JWT_ACCESS_TOKEN_EXPIRES_IN, COOKIE_JWT_REFRESH_TOKEN_EXPIRES_IN } from 'src/constants';
import { LoggedUser } from 'src/common/decorators/logged-user.decorator';
import { User } from 'src/modules/users/entities/user.entity';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   *
   * Generate jwt access and refresh token
   */
  @HttpCode(HttpStatus.OK)
  @Post('sign-in')
  async signIn(@Res({ passthrough: true }) res: Response, @Body() dto: SignInDto) {
    const { accessToken, refreshToken } = await this.authService.signIn(dto);
    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('access-token', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: COOKIE_JWT_ACCESS_TOKEN_EXPIRES_IN,
    });

    res.cookie('refresh-token', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: COOKIE_JWT_REFRESH_TOKEN_EXPIRES_IN,
    });
  }

  /**
   *
   * Endpoint to generate new access token
   */
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response, @LoggedUser() user: User) {
    const refreshToken = req.cookies['refresh-token'];
    const newAccessToken = await this.authService.refreshToken(refreshToken, user);

    return {
      accessToken: newAccessToken,
    };
  }

  /**
   *
   * Returns logged user profile
   */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('/me')
  getProfile(@Req() req) {
    return req.user;
  }
}
