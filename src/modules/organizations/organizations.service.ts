import { Injectable } from '@nestjs/common';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { OrganizationsRepository } from './organizations.repository';

@Injectable()
export class OrganizationsService {
  constructor(
    private readonly organizationsRepository: OrganizationsRepository,
  ) {}
  async create(dto: CreateOrganizationDto, userId: string) {
    return this.organizationsRepository.create(dto, userId);
  }
}
