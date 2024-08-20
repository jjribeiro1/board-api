import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/modules/database/prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePostDto, userId: string) {
    const { boardId, description, isLocked, isPinned, isPrivate, statusId, title } = dto;
    const result = await this.prisma.post.create({
      data: {
        authorId: userId,
        boardId,
        description,
        isLocked,
        isPinned,
        isPrivate,
        statusId,
        title,
      },
    });

    return result.id;
  }
}
