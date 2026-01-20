import { Module } from '@nestjs/common';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { CommentsRepository } from './comments.repository';
import { PostsModule } from '../posts/posts.module';
import { RESOURCE_RESOLVER } from 'src/constants';

@Module({
  imports: [PostsModule],
  controllers: [CommentsController],
  providers: [CommentsService, { provide: RESOURCE_RESOLVER, useExisting: CommentsService }, CommentsRepository],
})
export class CommentsModule {}
