import { SignInDto } from 'src/app/auth/dto/sign-in.dto';

export const mockSignInDto: SignInDto = {
  email: 'any-email',
  password: 'any-password',
};

export const mockJwtService = {
  signAsync: jest.fn(),
};
