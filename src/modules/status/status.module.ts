import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/shared/modules/database/prisma/prisma.module';
import { StatusController } from './status.controller';
import { StatusService } from './status.service';
import { StatusRepository } from './status.repository';

@Module({
  imports: [PrismaModule],
  controllers: [StatusController],
  providers: [StatusService, StatusRepository],
})
export class StatusModule {}
