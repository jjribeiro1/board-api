import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { CryptoModule } from './crypto/crypto.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [PrismaModule, UsersModule, CryptoModule, AuthModule],
})
export class AppModule {}
