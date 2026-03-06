import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommentsRepository } from './comments.repository';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { PostsService } from '../posts/posts.service';
import { ResourceOwnershipInfo, ResourceOwnershipResolver } from 'src/common/interfaces/resource-info.interface';
import { EVENTS } from 'src/constants/events';
import { PostCommentedEventDto } from '../events/dto/post-events.dto';
import { UserPayload } from 'src/common/types/user-payload';

@Injectable()
export class CommentsService implements ResourceOwnershipResolver {
  constructor(
    private readonly postsService: PostsService,
    private readonly commentsRepository: CommentsRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(dto: CreateCommentDto, user: UserPayload) {
    const post = await this.postsService.findOne(dto.postId);
    if (post.isLocked) {
      throw new ForbiddenException('Não é possível comentar em um post bloqueado');
    }

    if (dto.parentId) {
      const parentComment = await this.commentsRepository.findById(dto.parentId);
      if (!parentComment) {
        throw new NotFoundException(`comentário pai com id: ${dto.parentId} não encontrado`);
      }
      if (parentComment.parentId) {
        throw new ForbiddenException('Não é permitido responder uma resposta');
      }
      if (parentComment.postId !== dto.postId) {
        throw new ForbiddenException('A resposta deve pertencer ao mesmo post do comentário original');
      }
    }

    const commentId = await this.commentsRepository.create(dto, user.id);

    this.eventEmitter.emit(
      EVENTS.post.commented,
      new PostCommentedEventDto(
        post.id,
        post.title,
        post.author.id,
        commentId,
        dto.content,
        user.id,
        user.name,
        post.organizationId,
      ),
    );

    return commentId;
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

  async findOrgAndAuthorId(commentId: string): Promise<ResourceOwnershipInfo | null> {
    return this.commentsRepository.findOrgAndAuthorId(commentId);
  }
}
