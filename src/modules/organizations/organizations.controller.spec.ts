import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';
import { mockOrganizationsService, mockCreateOrganizationDto, mockOrganizationEntity } from 'test/mocks/organizations';
import { mockUserEntity } from 'test/mocks/user';
import '../../shared/modules/auth/guards/jwt-auth.guard';

jest.mock('../../shared/modules/auth/guards/jwt-auth.guard', () => ({
  JwtAuthGuard: jest.fn().mockImplementationOnce(() => ({
    canActivate: jest.fn().mockReturnValue(true),
  })),
}));

describe('OrganizationsController', () => {
  let controller: OrganizationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganizationsController],
      providers: [{ provide: OrganizationsService, useValue: mockOrganizationsService }],
    }).compile();

    controller = module.get<OrganizationsController>(OrganizationsController);
  });

  describe('create', () => {
    it('should call OrganizationsService with correct values', async () => {
      await controller.create(mockCreateOrganizationDto, mockUserEntity);
      expect(mockOrganizationsService.create).toHaveBeenCalledWith(mockCreateOrganizationDto, mockUserEntity.id);
    });

    it('should throw if OrganizationsService throws', async () => {
      mockOrganizationsService.create.mockRejectedValueOnce(new Error('error'));
      await expect(controller.create(mockCreateOrganizationDto, mockUserEntity)).rejects.toThrow(new Error('error'));
    });

    it('should return the ID of the organization created', async () => {
      mockOrganizationsService.create.mockResolvedValueOnce(mockOrganizationEntity.id);
      const result = await controller.create(mockCreateOrganizationDto, mockUserEntity);

      expect(result).toBe(mockOrganizationEntity.id);
    });
  });
});
