import { Module } from '@nestjs/common';
import { RoadmapController } from './roadmap.controller';
import { RoadmapService } from './roadmap.service';
import { RoadmapRepository } from './roadmap.repository';
import { RESOURCE_RESOLVER } from 'src/constants';

@Module({
  controllers: [RoadmapController],
  providers: [RoadmapService, { provide: RESOURCE_RESOLVER, useExisting: RoadmapService }, RoadmapRepository],
  exports: [RoadmapService],
})
export class RoadmapModule {}
