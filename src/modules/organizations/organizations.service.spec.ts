import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationsService } from './organizations.service';
import { OrganizationsRepository } from './organizations.repository';
import {
  mockOrganizationsRepository,
  mockCreateOrganizationDto,
  mockOrganizationEntity,
} from 'test/mocks/organizations';

describe('OrganizationsService', () => {
  let organizationsService: OrganizationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationsService,
        {
          provide: OrganizationsRepository,
          useValue: mockOrganizationsRepository,
        },
      ],
    }).compile();

    organizationsService =
      module.get<OrganizationsService>(OrganizationsService);
  });

  describe('create', () => {
    it('should call OrganizationsRepository with correct values', async () => {
      await organizationsService.create(mockCreateOrganizationDto, 'any-id');
      expect(mockOrganizationsRepository.create).toHaveBeenCalledWith(
        { name: 'any-name', logoUrl: null },
        'any-id',
      );
    });

    it('should throw if OrganizationsRepository throws', async () => {
      mockOrganizationsRepository.create.mockRejectedValueOnce(
        new Error('error'),
      );

      await expect(
        organizationsService.create(mockCreateOrganizationDto, 'any-id'),
      ).rejects.toThrow(new Error('error'));
    });

    it('should return the ID of the organization created', async () => {
      mockOrganizationsRepository.create.mockResolvedValueOnce(
        mockOrganizationEntity.id,
      );

      const result = await organizationsService.create(
        mockCreateOrganizationDto,
        'any-id',
      );
      expect(result).toBe(mockOrganizationEntity.id);
    });
  });
});
