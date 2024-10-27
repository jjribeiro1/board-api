import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { LoggedUser } from 'src/common/decorators/logged-user.decorator';
import { User } from '../users/entities/user.entity';
import { JwtAuthGuard } from 'src/shared/modules/auth/guards/jwt-auth.guard';

@ApiTags('comments')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  /**
   *
   * Create new comment and returns the ID
   */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateCommentDto, @LoggedUser() user: User) {
    return this.commentsService.create(dto, user.id);
  }
}
