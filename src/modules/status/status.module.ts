import { Module } from '@nestjs/common';
import { StatusController } from './status.controller';
import { StatusService } from './status.service';
import { StatusRepository } from './status.repository';
import { RESOURCE_RESOLVER } from 'src/constants';

@Module({
  controllers: [StatusController],
  providers: [StatusService, { provide: RESOURCE_RESOLVER, useExisting: StatusService }, StatusRepository],
  exports: [StatusService],
})
export class StatusModule {}
