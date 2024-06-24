import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UsersModule } from 'src/app/users/users.module';
import { CryptoModule } from 'src/app/crypto/crypto.module';
import { EnvironmentVariables } from 'src/config/env.validation';
import { JWT_EXPIRES } from './constants';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: async (
        configService: ConfigService<EnvironmentVariables>,
      ) => ({
        publicKey: await configService.get('JWT_PUBLIC_KEY'),
        privateKey: await configService.get('JWT_PRIVATE_KEY'),
        signOptions: {
          algorithm: 'RS256',
          allowInsecureKeySizes: false,
          allowInvalidAsymmetricKeyTypes: false,
          expiresIn: JWT_EXPIRES,
        },
        verifyOptions: {
          algorithms: ['RS256'],
          ignoreExpiration: false,
          allowInvalidAsymmetricKeyTypes: false,
        },
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    CryptoModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard],
})
export class AuthModule {}
