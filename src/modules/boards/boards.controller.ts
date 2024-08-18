import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { LoggedUser } from 'src/decorators/logged-user.decorator';
import { User } from '../users/entities/user.entity';
import { JwtAuthGuard } from 'src/shared/modules/auth/guards/jwt-auth.guard';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('boards')
@Controller('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  /**
   *
   * Create new board and returns the ID
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateBoardDto, @LoggedUser() user: User) {
    return this.boardsService.create(dto, user.id);
  }
}
