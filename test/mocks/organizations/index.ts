import { CreateOrganizationDto } from 'src/modules/organizations/dto/create-organization.dto';
import { Organization } from 'src/modules/organizations/entities/organization.entity';

export const mockCreateOrganizationDto: CreateOrganizationDto = {
  name: 'any-name',
  logoUrl: null,
};

export const mockOrganizationEntity: Organization = {
  id: 'any-id',
  name: 'any-name',
  logoUrl: 'any-url',
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockOrganizationsRepository = {
  create: jest.fn()
}

export const mockOrganizationsService = {
  create: jest.fn()
}
