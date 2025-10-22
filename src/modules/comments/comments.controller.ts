import { Controller, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { LoggedUser } from 'src/common/decorators/logged-user.decorator';
import { AllowedOrganizationRoles } from 'src/common/decorators/organization-role-decorator';
import { OrganizationRolesOptions } from 'src/common/types/user-organization-role';
import { User } from '../users/entities/user.entity';
import { MutateCommentGuard } from './guards/mutate-comment.guard';

@ApiBearerAuth()
@ApiTags('comments')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  /**
   *
   * Create new comment and returns the ID
   */
  @ApiBearerAuth()
  @Post()
  async create(@Body() dto: CreateCommentDto, @LoggedUser() user: User) {
    return this.commentsService.create(dto, user.id);
  }

  /**
   *
   * Update the comment
   */
  @AllowedOrganizationRoles([OrganizationRolesOptions.OWNER, OrganizationRolesOptions.ADMIN])
  @UseGuards(MutateCommentGuard)
  @ApiBearerAuth()
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateCommentDto) {
    return this.commentsService.update(id, dto);
  }

  /**
   * Delete the comment
   */
  @AllowedOrganizationRoles([OrganizationRolesOptions.OWNER, OrganizationRolesOptions.ADMIN])
  @UseGuards(MutateCommentGuard)
  @ApiBearerAuth()
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.commentsService.delete(id);
  }
}
