import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { CryptoService } from '../../shared/modules/crypto/crypto.service';
import {
  mockCreateUserDto,
  mockUserEntity,
  mockUsersRepository,
} from 'test/mocks/user';
import { mockCryptoService } from 'test/mocks/crypto';

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
        {
          provide: CryptoService,
          useValue: mockCryptoService,
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
  });

  describe('create', () => {
    it('should throw ConflictException if email already in use', async () => {
      mockUsersRepository.findByEmail.mockResolvedValueOnce(mockUserEntity);
      await expect(usersService.create(mockCreateUserDto)).rejects.toThrow(
        new ConflictException(
          `Email ${mockCreateUserDto.email} já foi registrado`,
        ),
      );
    });

    it('should call UsersRepository with correct values', async () => {
      mockCryptoService.hasher.mockResolvedValueOnce('any-hash');
      await usersService.create(mockCreateUserDto);
      expect(mockUsersRepository.create).toHaveBeenCalledWith({
        ...mockCreateUserDto,
        password: 'any-hash',
      });
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
