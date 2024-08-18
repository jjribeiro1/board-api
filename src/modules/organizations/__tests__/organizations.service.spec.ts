import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { OrganizationsService } from '../organizations.service';
import { OrganizationsRepository } from '../organizations.repository';
import {
  mockOrganizationsRepository,
  mockCreateOrganizationDto,
  mockOrganizationEntity,
} from 'test/mocks/organizations';
import { mockBoardEntity } from 'test/mocks/boards';

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

    organizationsService = module.get<OrganizationsService>(OrganizationsService);
  });

  describe('create', () => {
    it('should call OrganizationsRepository with correct values', async () => {
      await organizationsService.create(mockCreateOrganizationDto, 'any-id');
      expect(mockOrganizationsRepository.create).toHaveBeenCalledWith({ name: 'any-name', logoUrl: null }, 'any-id');
    });

    it('should throw if OrganizationsRepository throws', async () => {
      mockOrganizationsRepository.create.mockRejectedValueOnce(new Error('error'));

      await expect(organizationsService.create(mockCreateOrganizationDto, 'any-id')).rejects.toThrow(
        new Error('error'),
      );
    });

    it('should return the ID of the organization created', async () => {
      mockOrganizationsRepository.create.mockResolvedValueOnce(mockOrganizationEntity.id);

      const result = await organizationsService.create(mockCreateOrganizationDto, 'any-id');
      expect(result).toBe(mockOrganizationEntity.id);
    });
  });

  describe('findOne', () => {
    it('should return organization by id', async () => {
      mockOrganizationsRepository.findOne.mockResolvedValueOnce(mockOrganizationEntity);
      const result = await organizationsService.findOne('any-id');
      expect(result).toEqual(mockOrganizationEntity);
    });

    it('should throw NotFoundException if organization not exists', async () => {
      mockOrganizationsRepository.findOne.mockResolvedValueOnce(null);
      await expect(organizationsService.findOne('any-id')).rejects.toThrow(
        new NotFoundException(`organização com id: any-id não encontrada`),
      );
    });

    it('should throw if OrganizationsRepository throws', async () => {
      mockOrganizationsRepository.findOne.mockRejectedValueOnce(new Error('error'));
      await expect(organizationsService.findOne('any-id')).rejects.toThrow(new Error('error'));
    });
  });

  describe('findBoardsFromOrganization', () => {
    it('should return an array of boards', async () => {
      mockOrganizationsRepository.findOne.mockResolvedValueOnce(mockOrganizationEntity);
      mockOrganizationsRepository.findBoardsFromOrganization.mockResolvedValueOnce([mockBoardEntity]);
      const result = await organizationsService.findBoardsFromOrganization('any-id');
      expect(result).toEqual([mockBoardEntity]);
    });

    it('should throw NotFoundException if organization not exists', async () => {
      mockOrganizationsRepository.findOne.mockResolvedValueOnce(null);
      await expect(organizationsService.findBoardsFromOrganization('any-id')).rejects.toThrow(
        new NotFoundException('organização com id: any-id não encontrada'),
      );
    });

    it('should throw if Repository throws', async () => {
      mockOrganizationsRepository.findOne.mockResolvedValueOnce(mockOrganizationEntity);
      mockOrganizationsRepository.findBoardsFromOrganization.mockRejectedValueOnce(new Error('error'));
      await expect(organizationsService.findBoardsFromOrganization('any-id')).rejects.toThrow(new Error('error'));
    });
  });
});
