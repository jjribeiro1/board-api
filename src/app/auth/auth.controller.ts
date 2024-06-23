import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   *
   * Generate jwt access token
   */
  @HttpCode(HttpStatus.OK)
  @Post('sign-in')
  async signIn(@Body() dto: SignInDto) {
    return this.authService.signIn(dto);
  }
}
