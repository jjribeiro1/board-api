import { Module } from '@nestjs/common';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { CommentsRepository } from './comments.repository';
import { PrismaModule } from 'src/shared/modules/database/prisma/prisma.module';
import { AuthModule } from 'src/shared/modules/auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [CommentsController],
  providers: [CommentsService, CommentsRepository],
})
export class CommentsModule {}
