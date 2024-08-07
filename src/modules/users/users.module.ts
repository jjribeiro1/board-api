import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { PrismaModule } from 'src/shared/modules/database/prisma/prisma.module';
import { CryptoModule } from 'src/shared/modules/crypto/crypto.module';

@Module({
  imports: [PrismaModule, CryptoModule],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersRepository],
})
export class UsersModule {}
