import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommentsRepository } from './comments.repository';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { PostsService } from '../posts/posts.service';

@Injectable()
export class CommentsService {
  constructor(
    private readonly postsService: PostsService,
    private readonly commentsRepository: CommentsRepository,
  ) {}

  async create(dto: CreateCommentDto, userId: string) {
    const post = await this.postsService.findOne(dto.postId);
    if (post.isLocked) {
      throw new ForbiddenException('Não é possível comentar em um post bloqueado');
    }

    return this.commentsRepository.create(dto, userId);
  }

  async findOne(commentId: string) {
    const comment = await this.commentsRepository.findOne(commentId);
    if (!comment) {
      throw new NotFoundException(`comentário com id: ${commentId} não encontrado`);
    }
    return comment;
  }

  async update(commentId: string, dto: UpdateCommentDto) {
    const comment = await this.findOne(commentId);
    await this.commentsRepository.update(comment.id, dto);
  }

  async delete(commentId: string) {
    await this.findOne(commentId);
    return this.commentsRepository.delete(commentId);
  }

  async findAuthorAndOrgIdFromComment(commendId: string) {
    return this.commentsRepository.findAuthorAndOrgIdFromComment(commendId);
  }
}
