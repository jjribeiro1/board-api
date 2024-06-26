import { SignInDto } from 'src/modules/auth/dto/sign-in.dto';

export const mockSignInDto: SignInDto = {
  email: 'any-email',
  password: 'any-password',
};

export const mockJwtService = {
  signAsync: jest.fn(),
  verifyAsync: jest.fn()
};

export const mockAuthService = {
  signIn: jest.fn(),
  extractUserFromToken: jest.fn()
};
