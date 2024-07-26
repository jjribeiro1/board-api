import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { OrganizationsService } from './organizations.service';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { LoggedUser } from 'src/decorators/logged-user.decorator';
import { User } from 'src/modules/users/entities/user.entity';

@ApiTags('organizations')
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  /**
   *
   * Create new organization and returns the ID
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() dto: CreateOrganizationDto, @LoggedUser() user: User) {
    return this.organizationsService.create(dto, user.id);
  }
}
