import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/shared/modules/auth/guards/jwt-auth.guard';
import { CreatePostDto } from './dto/create-post.dto';
import { User } from '../users/entities/user.entity';
import { LoggedUser } from 'src/decorators/logged-user.decorator';
import { PostsService } from './posts.service';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  /**
   *
   * Create new Post and returns the ID
   */
  @UseGuards(JwtAuthGuard)
  @Post('')
  async create(@Body() dto: CreatePostDto, @LoggedUser() loggedUser: User) {
    return this.postsService.create(dto, loggedUser.id);
  }
}
