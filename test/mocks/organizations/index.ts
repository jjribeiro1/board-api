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
  members: [],
  organizationStatus: [],
  organizationTags: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

export const mockOrganizationsRepository = {
  create: jest.fn(),
  findOne: jest.fn(),
  findBoardsFromOrganization: jest.fn(),
  findPostsFromOrganization: jest.fn(),
};

export const mockOrganizationsService = {
  create: jest.fn(),
  findOne: jest.fn(),
  findBoardsFromOrganization: jest.fn(),
  findPostsFromOrganization: jest.fn(),
};
