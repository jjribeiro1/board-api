import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CryptoModule } from 'src/modules/crypto/crypto.module';
import { UsersModule } from 'src/modules/users/users.module';
import { EnvironmentVariables } from 'src/config/env.validation';
import { JWT_EXPIRES } from 'src/constants';

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
  exports: [AuthService]
})
export class AuthModule {}
