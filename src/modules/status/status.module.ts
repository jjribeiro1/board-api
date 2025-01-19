import { Module } from '@nestjs/common';
import { StatusController } from './status.controller';
import { StatusService } from './status.service';
import { StatusRepository } from './status.repository';

@Module({
  controllers: [StatusController],
  providers: [StatusService, StatusRepository],
})
export class StatusModule {}
