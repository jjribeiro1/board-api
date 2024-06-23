import { Test, TestingModule } from '@nestjs/testing';
import { UsersRepository } from './users.repository';

describe('UsersRepository', () => {
  let usersRepository: UsersRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: UsersRepository,
          useValue: {
            create: jest.fn(() => ({
              id: 'any-id',
              name: 'any-name',
              email: 'any-email',
              password: 'any-password',
            })),
          },
        },
      ],
    }).compile();

    usersRepository = module.get<UsersRepository>(UsersRepository);
  });

  describe('create', () => {
    it('should create a new user ', async () => {
      const input = {
        name: 'any-name',
        email: 'any-email',
        password: 'any-password',
      };
      const output = {
        ...input,
        id: 'any-id',
      };

      const result = await usersRepository.create(input);
      expect(result).toEqual(output);
    });
  });
});
