import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { StatusService } from './status.service';
import { CreateStatusDto } from './dto/create-status.dto';
import { LoggedUser } from 'src/common/decorators/logged-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('status')
@Controller('status')
export class StatusController {
  constructor(private readonly statusService: StatusService) {}

  /**
   *
   * Returns all status from an organization
   */
  @ApiBearerAuth()
  @Get()
  async findAll(@Req() req: Request) {
    const orgId = req.cookies['org-id'];
    const status = await this.statusService.findAll(orgId);
    return {
      data: status,
    };
  }

  /**
   * Creates a new status
   *
   */
  @ApiBearerAuth()
  @Post()
  async create(@Body() dto: CreateStatusDto, @LoggedUser() user: User, @Req() req: Request) {
    const orgId = req.cookies['org-id'];
    return await this.statusService.create(dto, user, orgId);
  }
}
