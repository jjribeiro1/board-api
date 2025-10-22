import { Controller, Post, Body, Get, Param, HttpStatus, UseGuards, Delete, HttpCode, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { ManageBoardDto } from './dto/manage-board.dto';
import { User } from '../users/entities/user.entity';
import { LoggedUser } from 'src/common/decorators/logged-user.decorator';
import { AllowedOrganizationRoles } from 'src/common/decorators/organization-role-decorator';
import { OrganizationRolesOptions } from 'src/common/types/user-organization-role';
import { ManageBoardGuard } from './guards/manage-board.guard';

@ApiTags('boards')
@Controller('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  /**
   *
   * Create new board and returns the ID
   */
  @ApiBearerAuth()
  @Post()
  async create(@Body() dto: CreateBoardDto, @LoggedUser() user: User) {
    return this.boardsService.create(dto, user.id);
  }

  /**
   *
   * Returns an board by ID
   */
  @ApiBearerAuth()
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
  @ApiBearerAuth()
  @Get(':id/posts')
  async findPosts(@Param('id') boardId: string, @LoggedUser() user: User) {
    const posts = await this.boardsService.findPostsFromBoard(boardId, user.id);
    return {
      data: posts,
    };
  }

  /**
   * Manage Board settings
   */
  @AllowedOrganizationRoles([OrganizationRolesOptions.OWNER, OrganizationRolesOptions.ADMIN])
  @UseGuards(ManageBoardGuard)
  @ApiBearerAuth()
  @Patch(':id/settings')
  async manageBoard(@Param('id') boardId: string, @Body() dto: ManageBoardDto) {
    return await this.boardsService.manageBoard(boardId, dto);
  }

  /**
   *
   * Removes a board by ID
   */
  @AllowedOrganizationRoles([OrganizationRolesOptions.OWNER])
  @UseGuards(ManageBoardGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async remove(@Param('id') boardId: string) {
    return this.boardsService.remove(boardId);
  }
}
