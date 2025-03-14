import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/modules/database/prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';
import { Comment } from '../comments/entities/comment.entity';

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
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        description: true,
        isPrivate: true,
        isPinned: true,
        isLocked: true,
        boardId: true,
        authorId: true,
        status: { select: { id: true, name: true, color: true, order: true } },
        tags: { select: { tagId: true } },
        createdAt: true,
        updatedAt: true,
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
      result.status,
      result.tags.map((data) => data.tagId),
      result.createdAt,
      result.updatedAt,
      null,
    );
  }

  async findCommentsFromPost(postId: string) {
    const results = await this.prisma.comment.findMany({
      where: {
        deletedAt: null,
        post: {
          id: postId,
        },
      },
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

    return results.map(
      (result) =>
        new Comment(
          result.id,
          result.content,
          result.author.id,
          result.author.name,
          result.postId,
          result.createdAt,
          result.updatedAt,
          result.deletedAt,
        ),
    );
  }

  async update(postId: string, dto: UpdatePostDto) {
    const updatedPost = await this.prisma.post.update({
      where: { id: postId },
      data: {
        ...dto,
      },
      include: {
        status: {
          select: {
            id: true,
            name: true,
            order: true,
          },
        },
      },
    });
    return updatedPost;
  }
}
