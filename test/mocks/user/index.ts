import { CreateUserDto } from 'src/app/users/dto/create-user.dto';
import { User } from 'src/app/users/entities/user.entity';

export const mockCreateUserDto: CreateUserDto = {
  name: 'any-name',
  email: 'any-email',
  password: 'any-password',
};

export const mockUserEntity = new User(
  'any-id',
  'any-name',
  'any-email',
  'any-password',
  new Date(),
  new Date(),
);

export const mockUsersService = {
  create: jest.fn(),
  findOne: jest.fn(),
};

export const mockUsersRepository = {
  create: jest.fn(),
  findOne: jest.fn(),
  findByEmail: jest.fn(),
};
