import { Controller, Post, Body, Param } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { InvitesService } from './invites.service';
import { CreateInviteDto } from './dto/create-invite.dto';
import { LoggedUser } from 'src/common/decorators/logged-user.decorator';
import { UserPayload } from 'src/common/types/user-payload';

@Controller('invites')
export class InvitesController {
  constructor(private readonly invitesService: InvitesService) {}

  /**
   * Create an invite for an organization
   */
  @ApiBearerAuth()
  @Post()
  async create(@Body() dto: CreateInviteDto, @LoggedUser() user: UserPayload) {
    return await this.invitesService.create(dto, user);
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
