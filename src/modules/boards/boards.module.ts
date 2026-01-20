import { Module } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { BoardsController } from './boards.controller';
import { BoardsRepository } from './boards.repository';
import { RESOURCE_RESOLVER } from 'src/constants';

@Module({
  controllers: [BoardsController],
  providers: [BoardsService, { provide: RESOURCE_RESOLVER, useExisting: BoardsService }, BoardsRepository],
  exports: [BoardsService],
})
export class BoardsModule {}
