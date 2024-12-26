import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { CreatePostDto } from './dto/create-post.dto';
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
   * Returns posts from an Organization
   */
  @UseGuards(JwtAuthGuard)
  @Get('organization')
  async findPostsFromOrganization(@Req() req: Request) {
    const orgId = req.cookies['orgId'];
    const posts = await this.postsService.findPostsFromOrganization(orgId);
    return {
      data: posts,
    };
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
}
