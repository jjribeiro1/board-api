import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationsRepository } from './organizations.repository';
import { PrismaService } from 'src/shared/modules/database/prisma/prisma.service';
import {
  MockContext,
  createMockContext,
} from 'src/shared/modules/database/prisma/prisma-client-mock';
import {
  mockCreateOrganizationDto,
  mockOrganizationEntity,
} from 'test/mocks/organizations';

describe('OrganizationsRepository', () => {
  let repository: OrganizationsRepository;
  let mockCtx: MockContext;

  beforeEach(async () => {
    mockCtx = createMockContext();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationsRepository,
        { provide: PrismaService, useValue: mockCtx.prisma },
      ],
    }).compile();

    repository = module.get<OrganizationsRepository>(OrganizationsRepository);
  });

  describe('create', () => {
    it('should create a new organization and return the ID', async () => {
      mockCtx.prisma.organization.create.mockResolvedValueOnce(
        mockOrganizationEntity,
      );
      const result = await repository.create(
        mockCreateOrganizationDto,
        'any-id',
      );
      expect(result).toBe('any-id');
    });
  });

  describe('findOne', () => {
    it('should return organization by id', async () => {
      mockCtx.prisma.organization.findUnique.mockResolvedValueOnce(
        mockOrganizationEntity,
      );

      const result = await repository.findOne('any-id');
      expect(result).toBeTruthy;
    });

    it('should return null if user not exists', async () => {
      mockCtx.prisma.organization.findUnique.mockResolvedValueOnce(null);

      const result = await repository.findOne('any-id');
      expect(result).toBe(null);
    });
  });
});
