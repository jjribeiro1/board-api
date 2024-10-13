import { Controller, Post, Body, UseGuards, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { OrganizationsService } from './organizations.service';
import { JwtAuthGuard } from 'src/shared/modules/auth/guards/jwt-auth.guard';
import { LoggedUser } from 'src/decorators/logged-user.decorator';
import { User } from 'src/modules/users/entities/user.entity';

@ApiBearerAuth()
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

  /**
   *
   * Returns an organization by ID
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const organization = await this.organizationsService.findOne(id);
    return {
      data: organization,
    };
  }

  /**
   *
   * Returns all boards from an organization
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id/boards')
  async findBoards(@Param('id') id: string) {
    const boards = await this.organizationsService.findBoardsFromOrganization(id);
    return {
      data: boards,
    };
  }
}
