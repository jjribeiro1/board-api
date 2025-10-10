import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { PostsRepository } from './posts.repository';
import { BoardsModule } from '../boards/boards.module';
import { OrganizationsModule } from '../organizations/organizations.module';
import { VotesModule } from '../votes/votes.module';

@Module({
  imports: [BoardsModule, OrganizationsModule, VotesModule],
  controllers: [PostsController],
  providers: [PostsRepository, PostsService],
  exports: [PostsService],
})
export class PostsModule {}
