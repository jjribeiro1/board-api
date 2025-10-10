import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validate } from 'src/config/env.validation';
import { AppController } from './app.controller';
import { AuthModule } from './shared/modules/auth/auth.module';
import { PrismaModule } from './shared/modules/database/prisma/prisma.module';
import { EventsModule } from './modules/events/events.module';
import { UsersModule } from './modules/users/users.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { BoardsModule } from './modules/boards/boards.module';
import { PostsModule } from './modules/posts/posts.module';
import { CommentsModule } from './modules/comments/comments.module';
import { StatusModule } from './modules/status/status.module';
import { TagsModule } from './modules/tags/tags.module';
import { VotesModule } from './modules/votes/votes.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
    }),
    AuthModule,
    PrismaModule,
    EventsModule,
    UsersModule,
    OrganizationsModule,
    BoardsModule,
    PostsModule,
    CommentsModule,
    StatusModule,
    TagsModule,
    VotesModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
