import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/modules/database/prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';

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
}
