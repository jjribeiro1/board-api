import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CryptoModule } from 'src/shared/modules/crypto/crypto.module';
import { UsersModule } from 'src/modules/users/users.module';

@Global()
@Module({
  imports: [
    JwtModule.register({
      signOptions: {
        algorithm: 'RS256',
        allowInsecureKeySizes: false,
        allowInvalidAsymmetricKeyTypes: false,
      },
      verifyOptions: {
        algorithms: ['RS256'],
        ignoreExpiration: false,
        allowInvalidAsymmetricKeyTypes: false,
      },
    }),
    UsersModule,
    CryptoModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard],
  exports: [AuthService],
})
export class AuthModule {}
