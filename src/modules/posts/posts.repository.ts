import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/modules/database/prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
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

  async findCommentsFromPost(postId: string) {
    const results = await this.prisma.comment.findMany({
      where: {
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
          result.postId,
          result.createdAt,
          result.updatedAt,
          result.deletedAt,
        ),
    );
  }

  async findPostsFromOrganization(organizationId: string) {
    const posts = await this.prisma.post.findMany({
      where: {
        board: {
          organizationId: organizationId,
        },
      },
      include: {
        tags: true,
      },
    });

    return posts.map(
      (post) =>
        new Post(
          post.id,
          post.title,
          post.description,
          post.isPrivate,
          post.isPinned,
          post.isLocked,
          post.boardId,
          post.authorId,
          post.statusId,
          post.tags.map((data) => data.tagId),
          post.createdAt,
          post.updatedAt,
          post.deletedAt,
        ),
    );
  }
}
