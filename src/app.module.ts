import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './shared/modules/auth/auth.module';
import { CryptoModule } from './shared/modules/crypto/crypto.module';
import { PrismaModule } from './shared/modules/database/prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { BoardsModule } from './modules/boards/boards.module';
import { PostsModule } from './modules/posts/posts.module';
import { validate } from 'src/config/env.validation';
import { CommentsModule } from './modules/comments/comments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
    }),
    PrismaModule,
    AuthModule,
    CryptoModule,
    UsersModule,
    OrganizationsModule,
    BoardsModule,
    PostsModule,
    CommentsModule,
  ],
})
export class AppModule {}
