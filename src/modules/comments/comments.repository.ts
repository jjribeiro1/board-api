import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/modules/database/prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment } from './entities/comment.entity';

@Injectable()
export class CommentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCommentDto, userId: string) {
    const { content, postId } = dto;

    const result = await this.prisma.comment.create({
      data: { content, postId, authorId: userId },
    });

    return result.id;
  }

  async findOne(commendId: string) {
    const result = await this.prisma.comment.findUnique({
      where: { id: commendId, deletedAt: null },
    });

    if (!result) {
      return null;
    }

    return new Comment(
      result.id,
      result.content,
      result.authorId,
      result.postId,
      result.createdAt,
      result.updatedAt,
      result.deletedAt,
    );
  }

  async update(commentId: string, dto: UpdateCommentDto) {
    await this.prisma.comment.update({
      where: { id: commentId },
      data: { content: dto.content },
    });
  }
}
