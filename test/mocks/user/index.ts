import { CreateUserDto } from 'src/app/users/dto/create-user.dto';

export const mockCreateUserDto: CreateUserDto = {
  name: 'any-name',
  email: 'any-email',
  password: 'any-password',
};

export const mockUserEntity = {
  id: 'any-id',
  name: 'any-name',
  email: 'any-email',
  password: 'any-password',
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockUsersService = {
  create: jest.fn(),
};

export const mockUsersRepository = {
  create: jest.fn(),
  findOne: jest.fn()
};
