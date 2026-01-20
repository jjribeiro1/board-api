import { Module } from '@nestjs/common';
import { TagsService } from './tags.service';
import { TagsController } from './tags.controller';
import { TagsRepository } from './tags.repository';
import { RESOURCE_RESOLVER } from 'src/constants';

@Module({
  controllers: [TagsController],
  providers: [TagsService, { provide: RESOURCE_RESOLVER, useExisting: TagsService }, TagsRepository],
  exports: [TagsService],
})
export class TagsModule {}
