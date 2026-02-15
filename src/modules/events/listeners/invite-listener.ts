import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import { InvitesService } from 'src/modules/invites/invites.service';
import { MailService } from 'src/shared/modules/mail/mail.service';
import { EVENTS } from 'src/constants/events';
import { InvitesExpiredEventDto, InviteRetryEventDto, InviteCreatedEventDto } from '../dto/invites-events.dto';

@Injectable()
export class InviteEventsListener {
  constructor(
    private readonly invitesService: InvitesService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  @OnEvent(EVENTS.invite.created)
  async handleInviteCreated(payload: InviteCreatedEventDto) {
    await this.mailService.sendText(
      payload.email,
      'Convite para organização',
      `Você foi convidado para entrar na organização. 
      Use o seguinte link para aceitar o convite: ${this.configService.get('CLIENT_URL')}/invite/${payload.token}
      O convite expira em 7 dias.`,
    );
  }

  @OnEvent(EVENTS.invite.expired)
  async handleInviteExpired(payload: InvitesExpiredEventDto) {
    await this.invitesService.expireInvites(payload.inviteIds);
  }

  @OnEvent(EVENTS.invite.retried)
  async handleInviteRetry(payload: InviteRetryEventDto) {
    await this.mailService.sendText(
      payload.email,
      'Convite para organização',
      `Você foi convidado para entrar na organização. 
      Use o seguinte link para aceitar o convite: ${this.configService.get('CLIENT_URL')}/invite/${payload.token}
      O convite expira em 7 dias.`,
    );
  }
}
