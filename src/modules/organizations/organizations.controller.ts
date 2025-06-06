import { Controller, Post, Body, Get, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { OrganizationsService } from './organizations.service';
import { LoggedUser } from 'src/common/decorators/logged-user.decorator';
import { User } from 'src/modules/users/entities/user.entity';
import { ListPostsQueryDto } from './dto/list-post-query.dto';

@ApiBearerAuth()
@ApiTags('organizations')
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  /**
   *
   * Create new organization and returns the ID
   */
  @Post()
  async create(@Body() dto: CreateOrganizationDto, @LoggedUser() user: User) {
    return this.organizationsService.create(dto, user.id);
  }

  /**
   *
   * Returns an organization by ID
   */
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const organization = await this.organizationsService.findOne(id);
    return {
      data: organization,
    };
  }

  /**
   *
   * Returns all boards from an organization
   */
  @Get(':id/boards')
  async findBoards(@Param('id', ParseUUIDPipe) id: string) {
    const boards = await this.organizationsService.findBoardsFromOrganization(id);
    return {
      data: boards,
    };
  }

  /**
   *
   * Returns posts from an Organization
   */
  @Get(':id/posts')
  async findPostsFromOrganization(@Param('id', ParseUUIDPipe) orgId: string, @Query() query: ListPostsQueryDto) {
    const posts = await this.organizationsService.findPostsFromOrganization(orgId, query);
    return {
      data: posts,
    };
  }
}
