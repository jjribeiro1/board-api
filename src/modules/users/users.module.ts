import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { CryptoModule } from 'src/shared/modules/crypto/crypto.module';

@Module({
  imports: [CryptoModule],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersRepository],
})
export class UsersModule {}
