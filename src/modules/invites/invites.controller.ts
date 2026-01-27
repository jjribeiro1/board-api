import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InvitesService } from './invites.service';
import { CreateInviteDto } from './dto/create-invite.dto';
import { LoggedUser } from 'src/common/decorators/logged-user.decorator';
import { UserPayload } from 'src/common/types/user-payload';
import { OrganizationGuard } from 'src/common/guards/organization.guard';
import { AllowedOrganizationRoles } from 'src/common/decorators/organization-role.decorator';
import { OrganizationRolesOptions } from 'src/common/types/user-organization-role';
import { Public } from 'src/common/decorators/is-public.decorator';

@ApiTags('invites')
@Controller('invites')
export class InvitesController {
  constructor(private readonly invitesService: InvitesService) {}

  /**
   * Create an invite for an organization
   */
  @AllowedOrganizationRoles([OrganizationRolesOptions.OWNER, OrganizationRolesOptions.ADMIN])
  @UseGuards(OrganizationGuard)
  @ApiBearerAuth()
  @Post()
  async create(@Body() dto: CreateInviteDto, @LoggedUser() user: UserPayload) {
    return await this.invitesService.create(dto, user);
  }

  /**
   * List an invite by token
   */
  @Public()
  @Get(':token')
  async findOne(@Param('token') token: string) {
    const invite = await this.invitesService.findByToken(token);
    return {
      data: invite,
    };
  }

  /**
   * Accept an invite to join an organization
   */
  @ApiBearerAuth()
  @Post(':token/accept')
  async accept(@Param('token') token: string, @LoggedUser() user: UserPayload) {
    return await this.invitesService.accept(token, user);
  }
}
