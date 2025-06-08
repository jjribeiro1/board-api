import { Controller, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { LoggedUser } from 'src/common/decorators/logged-user.decorator';
import { User } from '../users/entities/user.entity';
import { MutateCommentGuard } from './guards/comment.guard';

@ApiBearerAuth()
@ApiTags('comments')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  /**
   *
   * Create new comment and returns the ID
   */
  @Post()
  async create(@Body() dto: CreateCommentDto, @LoggedUser() user: User) {
    return this.commentsService.create(dto, user.id);
  }

  /**
   *
   * Update the comment
   */
  @UseGuards(MutateCommentGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateCommentDto, @LoggedUser() user: User) {
    return this.commentsService.update(id, dto, user.id);
  }

  /**
   * Delete the comment
   */
  @UseGuards(MutateCommentGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @LoggedUser() user: User) {
    return this.commentsService.delete(id, user.id);
  }
}
