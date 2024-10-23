import { Controller, Post, Body, UseGuards, Get, Param } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { LoggedUser } from 'src/common/decorators/logged-user.decorator';
import { User } from '../users/entities/user.entity';
import { JwtAuthGuard } from 'src/shared/modules/auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('boards')
@Controller('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  /**
   *
   * Create new board and returns the ID
   */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() dto: CreateBoardDto, @LoggedUser() user: User) {
    return this.boardsService.create(dto, user.id);
  }

  /**
   *
   * Returns an board by ID
   */
  @Get(':id')
  async findOne(@Param('id') boardId: string) {
    const board = await this.boardsService.findOne(boardId);
    return {
      data: board,
    };
  }

  /**
   *
   * Returns all posts from an board
   */
  @Get(':id/posts')
  async findPosts(@Param('id') boardId: string) {
    const posts = await this.boardsService.findPostsFromBoard(boardId);
    return {
      data: posts,
    };
  }
}
