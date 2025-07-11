import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/modules/database/prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
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
        board: {
          select: {
            organizationId: true,
          },
        },
        author: { select: { id: true, name: true } },
        status: { select: { id: true, name: true, color: true } },
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
      result.board.organizationId,
      result.author,
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

    return results.map((result) => ({
      id: result.id,
      content: result.content,
      author: { id: result.author.id, name: result.author.name },
      postId: result.postId,
      organizationId: result.post.board.organizationId,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
      deletedAt: result.deletedAt,
    }));
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
          },
        },
      },
    });
    return updatedPost;
  }

  async delete(postId: string) {
    await this.prisma.post.update({ where: { id: postId }, data: { deletedAt: new Date() } });
  }

  async findAuthorAndOrgIdFromPost(postId: string) {
    const result = await this.prisma.post.findUnique({
      where: { id: postId, deletedAt: null },
      select: {
        authorId: true,
        board: {
          select: {
            organizationId: true,
          },
        },
      },
    });

    if (!result) {
      return null;
    }

    return {
      authorId: result.authorId,
      organizationId: result.board.organizationId,
    };
  }
}
