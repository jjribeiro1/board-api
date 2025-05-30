import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';
import { StatusService } from './status.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('status')
@Controller('status')
export class StatusController {
  constructor(private readonly statusService: StatusService) {}

  /**
   *
   * Returns all status from an organization
   */
  @Get()
  async findAll(@Req() req: Request) {
    const orgId = req.cookies['org-id'];
    const status = await this.statusService.findAll(orgId);
    return {
      data: status,
    };
  }
}
