import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { mockCreateUserDto, mockUsersService } from 'test/mocks/user';

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

      await expect(controller.create(mockCreateUserDto)).rejects.toThrow(
        new Error('error'),
      );
    });
  });
});
