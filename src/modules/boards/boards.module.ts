import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/shared/modules/database/prisma/prisma.module';
import { AuthModule } from 'src/shared/modules/auth/auth.module';
import { BoardsService } from './boards.service';
import { BoardsController } from './boards.controller';
import { BoardsRepository } from './boards.repository';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [BoardsController],
  providers: [BoardsService, BoardsRepository],
})
export class BoardsModule {}
