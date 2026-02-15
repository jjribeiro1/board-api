import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EVENTS } from 'src/constants/events';
import { InvitesExpiredEventDto } from '../dto/invites-expired-event.dto';
import { InvitesService } from 'src/modules/invites/invites.service';

@Injectable()
export class InviteEventsListener {
  constructor(private readonly invitesService: InvitesService) {}

  @OnEvent(EVENTS.invite.expired)
  async handleInviteExpired(payload: InvitesExpiredEventDto) {
    await this.invitesService.expireInvites(payload.inviteIds);
  }
}
