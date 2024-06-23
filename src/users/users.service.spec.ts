import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';

describe('UsersService', () => {
  let usersService: UsersService;

  const mockUsersRepository = {
    create: jest.fn(() => 'any-id'),
  };
  const mockCreateUserDto: CreateUserDto = {
    name: 'any-name',
    email: 'any-email',
    password: 'any-password',
  };

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
      const input = mockCreateUserDto;
      await usersService.create(input);
      expect(mockUsersRepository.create).toHaveBeenCalledWith(input);
    });

    it('should create a new user', async () => {
      const input = mockCreateUserDto;
      const result = await usersService.create(input);
      expect(result).toEqual('any-id');
    });

    it('should throw if UsersRepository throws', async () => {
      mockUsersRepository.create.mockImplementationOnce(() => {
        throw new Error('error');
      });
      await expect(usersService.create(mockCreateUserDto)).rejects.toThrow(
        new Error('error'),
      );
    });
  });
});
