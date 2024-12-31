import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsService } from './posts.service';
import { User } from '../users/entities/user.entity';
import { JwtAuthGuard } from 'src/shared/modules/auth/guards/jwt-auth.guard';
import { LoggedUser } from 'src/common/decorators/logged-user.decorator';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  /**
   *
   * Create new Post and returns the ID
   */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('')
  async create(@Body() dto: CreatePostDto, @LoggedUser() loggedUser: User) {
    return this.postsService.create(dto, loggedUser.id);
  }

  /**
   *
   * Returns an post by ID
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const post = await this.postsService.findOne(id);
    return {
      data: post,
    };
  }

  /**
   *
   * Returns comments from an Post
   */
  @Get(':id/comments')
  async findComments(@Param('id') id: string) {
    const comments = await this.postsService.findCommentsFromPost(id);
    return {
      data: comments,
    };
  }

  /**
   * Update Post
   */
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdatePostDto) {
    await this.postsService.update(id, dto);
  }
}
