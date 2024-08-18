import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { OrganizationsRepository } from './organizations.repository';

@Injectable()
export class OrganizationsService {
  constructor(private readonly organizationsRepository: OrganizationsRepository) {}

  async create(dto: CreateOrganizationDto, userId: string) {
    return this.organizationsRepository.create(dto, userId);
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
}
