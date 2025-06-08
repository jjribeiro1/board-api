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
      select: {
        id: true,
        content: true,
        postId: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!result) {
      return null;
    }

    return new Comment(
      result.id,
      result.content,
      result.author.id,
      result.author.name,
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

  async delete(commentId: string) {
    await this.prisma.comment.update({
      where: { id: commentId },
      data: { deletedAt: new Date() },
    });
  }

  async findAuthorAndOrgIdFromComment(commendId: string) {
    const result = await this.prisma.comment.findUnique({
      where: { id: commendId, deletedAt: null },
      select: {
        authorId: true,
        post: {
          select: {
            board: {
              select: {
                organizationId: true,
              },
            },
          },
        },
      },
    });

    if (!result) {
      return null;
    }

    return {
      authorId: result.authorId,
      organizationId: result.post.board.organizationId,
    };
  }
}
