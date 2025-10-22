import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ManagePostDto } from './dto/manage-post.dto';
import { UpdatePostTagsDto } from './dto/update-post-tags.dto';
import { PostsService } from './posts.service';
import { User } from '../users/entities/user.entity';
import { LoggedUser } from 'src/common/decorators/logged-user.decorator';
import { AllowedOrganizationRoles } from 'src/common/decorators/organization-role-decorator';
import { OrganizationRolesOptions } from 'src/common/types/user-organization-role';
import { MutatePostGuard } from './guards/mutate-post.guard';
import { ManagePostGuard } from './guards/manage-post.guard';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  /**
   *
   * Create new Post and returns the ID
   */
  @ApiBearerAuth()
  @Post('')
  async create(@Body() dto: CreatePostDto, @LoggedUser() loggedUser: User) {
    return this.postsService.create(dto, loggedUser);
  }

  /**
   *
   * Returns an post by ID
   */
  @ApiBearerAuth()
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
  @ApiBearerAuth()
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
  @AllowedOrganizationRoles([OrganizationRolesOptions.OWNER, OrganizationRolesOptions.ADMIN])
  @UseGuards(MutatePostGuard)
  @ApiBearerAuth()
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdatePostDto) {
    const updatedPost = await this.postsService.update(id, dto);
    return {
      data: {
        post: updatedPost,
      },
    };
  }

  /**
   * Manage Post settings
   */
  @AllowedOrganizationRoles([OrganizationRolesOptions.ADMIN, OrganizationRolesOptions.OWNER])
  @UseGuards(ManagePostGuard)
  @ApiBearerAuth()
  @Patch(':id/settings')
  async managePost(@Param('id') id: string, @Body() dto: ManagePostDto) {
    const post = await this.postsService.update(id, dto);
    return {
      data: {
        post,
      },
    };
  }

  /**
   * Update Post Tags
   */
  @AllowedOrganizationRoles([OrganizationRolesOptions.OWNER, OrganizationRolesOptions.ADMIN])
  @UseGuards(ManagePostGuard)
  @ApiBearerAuth()
  @Patch(':id/tags')
  async updateTags(@Param('id') id: string, @Body() dto: UpdatePostTagsDto) {
    return await this.postsService.updateTags(id, dto);
  }

  /**
   * Delete Post
   */
  @AllowedOrganizationRoles([OrganizationRolesOptions.OWNER, OrganizationRolesOptions.ADMIN])
  @UseGuards(MutatePostGuard)
  @ApiBearerAuth()
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.postsService.remove(id);
  }

  /**
   * Add or remove vote from Post
   */
  @ApiBearerAuth()
  @Post(':id/vote')
  async vote(@Param('id') postId: string, @LoggedUser() loggedUser: User) {
    return this.postsService.vote(postId, loggedUser.id);
  }
}
