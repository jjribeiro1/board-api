import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { OrganizationCreatedEventDto } from '../dto/organization-created-event.dto';
import { EVENTS } from 'src/constants/events';
import { BoardsService } from 'src/modules/boards/boards.service';

@Injectable()
export class OrganizationEventsListener {
  constructor(private readonly boardsService: BoardsService) {}

  @OnEvent(EVENTS.organization.created)
  async handleOrganizationCreated(payload: OrganizationCreatedEventDto) {
    await this.boardsService.create(
      {
        organizationId: payload.organizationId,
        title: 'Feedback Board',
        description: 'Como podemos melhorar nosso produto?',
      },
      payload.ownerId,
    );
  }
}