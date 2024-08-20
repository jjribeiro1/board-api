import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/modules/database/prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePostDto) {
    const { authorId, boardId, description, isLocked, isPinned, isPrivate, statusId, title } = dto;
    const result = await this.prisma.post.create({
      data: {
        authorId,
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
