import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from './common/decorators/is-public.decorator';

@ApiTags('health')
@Public()
@Controller()
export class AppController {
  /**
   * Api healthcheck
   */
  @HttpCode(HttpStatus.OK)
  @Get('health')
  healthcheck() {
    return {
      status: 'UP',
      timestamp: new Date().toISOString(),
    };
  }
}
