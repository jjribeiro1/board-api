import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { ListPostsQueryDto } from './dto/list-post-query.dto';
import { EVENTS } from 'src/constants/events';
import { OrganizationCreatedEventDto } from '../events/dto/organization-created-event.dto';
import { OrganizationsRepository } from './organizations.repository';
import { slugify } from 'src/utils/slug';

@Injectable()
export class OrganizationsService {
  constructor(
    private readonly organizationsRepository: OrganizationsRepository,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(dto: CreateOrganizationDto, userId: string) {
    const slug = slugify(dto.name);
    const createdOrganizationId = await this.organizationsRepository.create(dto, slug, userId);
    this.eventEmitter.emit(EVENTS.organization.created, new OrganizationCreatedEventDto(createdOrganizationId, userId));
    return createdOrganizationId;
  }

  async findOne(organizationId: string) {
    const organization = await this.organizationsRepository.findOne(organizationId);
    if (!organization) {
      throw new NotFoundException(`organização com id: ${organizationId} não encontrada`);
    }

    return organization;
  }

  async findBoardsFromOrganization(organizationId: string) {
    await this.findOne(organizationId);
    return this.organizationsRepository.findBoardsFromOrganization(organizationId);
  }

  async findPostsFromOrganization(organizationId: string, filters: ListPostsQueryDto) {
    return this.organizationsRepository.findPostsFromOrganization(organizationId, filters);
  }

  async findMembersFromOrganization(organizationId: string) {
    await this.findOne(organizationId);
    return await this.organizationsRepository.findMembersFromOrganization(organizationId);
  }
}
