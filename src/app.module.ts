import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { CryptoModule } from './modules/crypto/crypto.module';
import { PrismaModule } from './modules/database/prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { validate } from 'src/config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
    }),
    PrismaModule,
    UsersModule,
    CryptoModule,
    AuthModule,
  ],
})
export class AppModule {}
