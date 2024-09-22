import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';
import { mockCreateUserDto, mockUserEntity, mockUsersService } from 'test/mocks/user';
import { NotFoundException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  describe('create', () => {
    it('should return the id of created user', async () => {
      mockUsersService.create.mockResolvedValueOnce('any-id');
      const result = await controller.create(mockCreateUserDto);
      expect(result).toEqual('any-id');
    });

    it('should throw if UsersService throws', async () => {
      mockUsersService.create.mockRejectedValueOnce(new Error('error'));

      await expect(controller.create(mockCreateUserDto)).rejects.toThrow(new Error('error'));
    });
  });

  describe('findOne', () => {
    it('should return user by id', async () => {
      mockUsersService.findOne.mockResolvedValueOnce(mockUserEntity);

      const result = await controller.findOne('any-id');
      expect(result).toEqual({ data: mockUserEntity.toPresentation() });
    });

    it('should throw if UsersService throws', async () => {
      mockUsersService.findOne.mockRejectedValueOnce(new NotFoundException());

      await expect(controller.findOne('any-id')).rejects.toThrow(new NotFoundException());
    });
  });

  describe('findOrgFromUser', () => {
    it('should return organizations from an user', async () => {
      const organizations = [
        { id: 'any-id', name: 'any-name', logoUrl: 'any-url', createdAt: new Date(), updatedAt: new Date() },
      ];

      mockUsersService.findOne.mockResolvedValueOnce(mockUserEntity);
      mockUsersService.organizationsFromUser.mockResolvedValueOnce(organizations);

      const result = await controller.findOrgFromUser('any-id');
      expect(result).toEqual({ data: organizations });
    });

    it('should throw if UsersService throws', async () => {
      mockUsersService.organizationsFromUser.mockRejectedValueOnce(new NotFoundException());
      await expect(controller.findOrgFromUser('any-id')).rejects.toThrow(new NotFoundException());
    });
  });
});
