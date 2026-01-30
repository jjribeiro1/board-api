import { Controller, Post, Body, Get, Param, Query, ParseUUIDPipe, Patch, Delete, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { ListPostsQueryDto } from './dto/list-post-query.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { OrganizationsService } from './organizations.service';
import { OrganizationGuard } from 'src/common/guards/organization.guard';
import { LoggedUser } from 'src/common/decorators/logged-user.decorator';
import { AllowedOrganizationRoles } from 'src/common/decorators/organization-role.decorator';
import { UserPayload } from 'src/common/types/user-payload';
import { OrganizationRolesOptions } from 'src/common/types/user-organization-role';

@ApiBearerAuth()
@ApiTags('organizations')
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  /**
   *
   * Create new organization and returns the ID
   */
  @ApiBearerAuth()
  @Post()
  async create(@Body() dto: CreateOrganizationDto, @LoggedUser() user: UserPayload) {
    return this.organizationsService.create(dto, user.id);
  }

  /**
   *
   * Returns an organization by ID
   */
  @ApiBearerAuth()
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
  @ApiBearerAuth()
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
  @ApiBearerAuth()
  @Get(':id/posts')
  async findPostsFromOrganization(@Param('id', ParseUUIDPipe) orgId: string, @Query() query: ListPostsQueryDto) {
    const posts = await this.organizationsService.findPostsFromOrganization(orgId, query);
    return {
      data: posts,
    };
  }

  /**
   *
   * Returns all members from an organization
   */
  @ApiBearerAuth()
  @Get(':id/members')
  async findMembersFromOrganization(@Param('id', ParseUUIDPipe) orgId: string) {
    const members = await this.organizationsService.findMembersFromOrganization(orgId);
    return {
      data: members,
    };
  }

  /**
   *
   * Returns all tags from an organization
   */
  @ApiBearerAuth()
  @Get(':id/tags')
  async findTagsFromOrganization(@Param('id', ParseUUIDPipe) orgId: string) {
    const tags = await this.organizationsService.findTagsFromOrganization(orgId);
    return {
      data: tags,
    };
  }

  /**
   *
   * Returns all status from an organization
   */
  @ApiBearerAuth()
  @Get(':id/status')
  async findStatusFromOrganization(@Param('id', ParseUUIDPipe) orgId: string) {
    const status = await this.organizationsService.findStatusFromOrganization(orgId);
    return {
      data: status,
    };
  }

  /**
   *
   * Returns all invites from an organization
   */
  @ApiBearerAuth()
  @Get(':id/invites')
  async findInvitesFromOrganization(@Param('id', ParseUUIDPipe) orgId: string) {
    const invites = await this.organizationsService.findInvitesFromOrganization(orgId);
    return {
      data: invites,
    };
  }

  /**
   *
   * Update member role
   */
  @ApiBearerAuth()
  @AllowedOrganizationRoles([OrganizationRolesOptions.OWNER])
  @UseGuards(OrganizationGuard)
  @Patch(':id/members/:userId/role')
  async updateMemberRole(
    @Param('id', ParseUUIDPipe) organizationId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    return await this.organizationsService.updateMemberRole(organizationId, userId, dto);
  }

  /**
   *
   * Remove member from organization
   */
  @ApiBearerAuth()
  @AllowedOrganizationRoles([OrganizationRolesOptions.OWNER])
  @UseGuards(OrganizationGuard)
  @Delete(':id/members/:userId')
  async removeMember(
    @Param('id', ParseUUIDPipe) organizationId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    return await this.organizationsService.removeMember(organizationId, userId);
  }
}
