import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { OrganizationCreatedEventDto } from '../dto/organization-created-event.dto';
import { EVENTS } from 'src/constants/events';
import { BoardsService } from 'src/modules/boards/boards.service';
import { StatusService } from 'src/modules/status/status.service';
import { TagsService } from 'src/modules/tags/tags.service';
import { OrganizationsService } from 'src/modules/organizations/organizations.service';

@Injectable()
export class OrganizationEventsListener {
  constructor(
    private readonly boardsService: BoardsService,
    private readonly statusService: StatusService,
    private readonly tagsService: TagsService,
    private readonly organizationsService: OrganizationsService,
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
    await this.tagsService.createDefaultTagsForOrg(payload.organizationId);

    const { defaultStatusId } = await this.statusService.createInitialStatusForOrg(payload.organizationId);
    await this.organizationsService.setDefaultStatus(payload.organizationId, defaultStatusId);
  }
}
