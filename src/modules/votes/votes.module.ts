import { Module } from '@nestjs/common';
import { VotesService } from './votes.service';
import { VotesRepository } from './votes.repository';

@Module({
  providers: [VotesService, VotesRepository],
  exports: [VotesService],
})
export class VotesModule {}
