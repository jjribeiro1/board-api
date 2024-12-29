import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { OrganizationsController } from '../organizations.controller';
import { OrganizationsService } from '../organizations.service';
import { mockOrganizationsService, mockCreateOrganizationDto, mockOrganizationEntity } from 'test/mocks/organizations';
import { mockUserEntity } from 'test/mocks/user';
import { mockBoardEntity } from 'test/mocks/boards';
import { mockPostEntity } from 'test/mocks/posts';
import 'src/shared/modules/auth/guards/jwt-auth.guard';

jest.mock('src/shared/modules/auth/guards/jwt-auth.guard', () => ({
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

  describe('findOne', () => {
    it('should return organization by id', async () => {
      mockOrganizationsService.findOne.mockResolvedValueOnce(mockOrganizationEntity);

      const result = await controller.findOne('any-id');
      expect(result).toEqual({ data: mockOrganizationEntity });
    });

    it('should throw if OrganizationsService throws', async () => {
      mockOrganizationsService.findOne.mockRejectedValueOnce(new NotFoundException());

      await expect(controller.findOne('any-id')).rejects.toThrow(new NotFoundException());
    });
  });

  describe('findBoardsFromOrganization', () => {
    it('should return boards from an organization', async () => {
      mockOrganizationsService.findBoardsFromOrganization.mockResolvedValueOnce([mockBoardEntity]);
      const result = await controller.findBoards('any-id');
      expect(result).toEqual({ data: [mockBoardEntity] });
    });

    it('should throw if OrganizationsService throws', async () => {
      mockOrganizationsService.findBoardsFromOrganization.mockRejectedValueOnce(new Error('error'));
      await expect(controller.findBoards('any-id')).rejects.toThrow(new Error('error'));
    });
  });

  describe('findPostsFromOrganization', () => {
    it('should return posts from an organization', async () => {
      mockOrganizationsService.findPostsFromOrganization.mockResolvedValueOnce([mockPostEntity]);

      const result = await controller.findPostsFromOrganization('any-org-id');
      expect(result).toEqual({ data: [mockPostEntity] });
    });

    it('should throw if OrganizationsService throws', async () => {
      mockOrganizationsService.findPostsFromOrganization.mockRejectedValueOnce(new Error('error'));
      await expect(controller.findPostsFromOrganization('any-org-id')).rejects.toThrow(new Error('error'));
    });
  });
});
