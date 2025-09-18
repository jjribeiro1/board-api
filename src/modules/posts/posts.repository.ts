import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/modules/database/prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePostDto, userId: string) {
    const { boardId, description, isLocked, isPinned, isPrivate, statusId, title, tagIds } = dto;
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
        tags:
          tagIds && tagIds.length > 0
            ? {
                create: tagIds.map((tagId) => ({
                  tagId,
                })),
              }
            : undefined,
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
        tags: { select: { tag: { select: { id: true, name: true, color: true } } } },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!result) {
      return null;
    }

    return {
      ...result,
      tags: result.tags.map((t) => t.tag),
      organizationId: result.board.organizationId,
    };
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

  async updateTags(postId: string, tagIds: string[]) {
    await this.prisma.$transaction([
      this.prisma.postTag.deleteMany({
        where: { postId },
      }),
      ...(tagIds.length > 0
        ? [
            this.prisma.postTag.createMany({
              data: tagIds.map((tagId) => ({
                postId,
                tagId,
              })),
            }),
          ]
        : []),
    ]);
  }
}
