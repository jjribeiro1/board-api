import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/modules/database/prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { Post } from './entities/post.entity';

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

  async findOne(postId: string) {
    const result = await this.prisma.post.findUnique({
      where: {
        id: postId,
      },
      include: {
        tags: true,
      },
    });

    if (!result) {
      return null;
    }

    return new Post(
      result.id,
      result.title,
      result.description,
      result.isPrivate,
      result.isPinned,
      result.isLocked,
      result.boardId,
      result.authorId,
      result.statusId,
      result.tags.map((data) => data.tagId),
      result.createdAt,
      result.updatedAt,
      null,
    );
  }
}
