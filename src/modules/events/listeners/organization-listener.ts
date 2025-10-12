import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { OrganizationCreatedEventDto } from '../dto/organization-created-event.dto';
import { EVENTS } from 'src/constants/events';
import { BoardsService } from 'src/modules/boards/boards.service';
import { StatusService } from 'src/modules/status/status.service';
import { TagsService } from 'src/modules/tags/tags.service';

@Injectable()
export class OrganizationEventsListener {
  constructor(
    private readonly boardsService: BoardsService,
    private readonly statusService: StatusService,
    private readonly tagsService: TagsService
  ) {}

  @OnEvent(EVENTS.organization.created)
  async handleOrganizationCreated(payload: OrganizationCreatedEventDto) {
    await this.boardsService.create(
      {
        organizationId: payload.organizationId,
        title: 'Novas funcionalidades',
        description: 'Como podemos melhorar nosso produto?',
      },
      payload.ownerId,
    );
    await this.statusService.createDefaultStatusForOrg(payload.organizationId);
    await this.tagsService.createDefaultTagsForOrg(payload.organizationId);
  }
}
