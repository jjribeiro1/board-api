import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { PrismaModule } from 'src/modules/database/prisma/prisma.module';
import { CryptoModule } from 'src/modules/crypto/crypto.module';

@Module({
  imports: [PrismaModule, CryptoModule],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersRepository],
})
export class UsersModule {}
