import { Controller, Get, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { StatusService } from './status.service';
import { ListStatusQueryDto } from './dto/list-status-query.dto';

@Controller('status')
export class StatusController {
  constructor(private readonly statusService: StatusService) {}

  @Get()
  async findAll(@Query() dto: ListStatusQueryDto, @Req() req: Request) {
    const orgId = req.cookies['org-id'];
    const status = await this.statusService.findAll(dto, orgId);
    return {
      data: status,
    };
  }
}
