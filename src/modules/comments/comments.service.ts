import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommentsRepository } from './comments.repository';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  constructor(private readonly commentsRepository: CommentsRepository) {}

  async create(dto: CreateCommentDto, userId: string) {
    return this.commentsRepository.create(dto, userId);
  }

  async findOne(commentId: string) {
    const comment = await this.commentsRepository.findOne(commentId);
    if (!comment) {
      throw new NotFoundException(`comentário com id: ${commentId} não encontrado`);
    }
    return comment;
  }

  async update(commentId: string, dto: UpdateCommentDto, userId: string) {
    const comment = await this.findOne(commentId);

    if (userId !== comment.authorId) {
      throw new ForbiddenException('Usuário sem permissão para realizar esta ação');
    }

    await this.commentsRepository.update(comment.id, dto);
  }

  async delete(commentId: string, userId: string) {
    const comment = await this.findOne(commentId);
    if (userId !== comment.authorId) {
      throw new ForbiddenException('Usuário sem permissão para realizar esta ação');
    }
    return this.commentsRepository.delete(commentId);
  }

  async findAuthorAndOrgIdFromComment(commendId: string) {
    return this.commentsRepository.findAuthorAndOrgIdFromComment(commendId);
  }
}
