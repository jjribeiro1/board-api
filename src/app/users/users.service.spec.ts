import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import {
  mockCreateUserDto,
  mockUserEntity,
  mockUsersRepository,
} from 'test/mocks/user';

describe('UsersService', () => {
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: mockUsersRepository,
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
  });

  describe('create', () => {
    it('should call UsersRepository with correct values', async () => {
      await usersService.create(mockCreateUserDto);
      expect(mockUsersRepository.create).toHaveBeenCalledWith(
        mockCreateUserDto,
      );
    });

    it('should create a new user', async () => {
      mockUsersRepository.create.mockResolvedValueOnce('any-id');
      const result = await usersService.create(mockCreateUserDto);
      expect(result).toEqual('any-id');
    });

    it('should throw if UsersRepository throws', async () => {
      mockUsersRepository.create.mockRejectedValueOnce(new Error('error'));
      await expect(usersService.create(mockCreateUserDto)).rejects.toThrow(
        new Error('error'),
      );
    });
  });

  describe('findOne', () => {
    it('should return user by id', async () => {
      mockUsersRepository.findOne.mockResolvedValueOnce(mockUserEntity);
      const result = await usersService.findOne('any-id');
      expect(result).toEqual(mockUserEntity);
    });

    it('should throw NotFoundException if user not exists', async () => {
      mockUsersRepository.findOne.mockResolvedValueOnce(null);
      await expect(usersService.findOne('any-id')).rejects.toThrow(
        new NotFoundException(`usuário com id: any-id não encontrado`),
      );
    });

    it('should throw if UsersRepository throws', async () => {
      mockUsersRepository.findOne.mockRejectedValueOnce(new Error('error'));
      await expect(usersService.findOne('any-id')).rejects.toThrow(
        new Error('error'),
      );
    });
  });
});
