import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/modules/database/prisma/prisma.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { ManageBoardDto } from './dto/manage-board.dto';

@Injectable()
export class BoardsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateBoardDto, userId: string) {
    const { description, organizationId, title, isLocked, isPrivate } = dto;
    const result = await this.prisma.board.create({
      data: {
        authorId: userId,
        description,
        organizationId,
        title,
        isLocked,
        isPrivate,
      },
    });
    return result.id;
  }

  async findOne(boardId: string) {
    const result = await this.prisma.board.findUnique({
      where: {
        id: boardId,
        deletedAt: null,
      },
    });

    if (!result) {
      return null;
    }

    return result;
  }

  async findPostsFromBoard(boardId: string, userId: string) {
    const result = await this.prisma.post.findMany({
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      where: {
        boardId,
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        isLocked: true,
        isPinned: true,
        isPrivate: true,
        description: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            name: true,
          },
        },
        status: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        _count: {
          select: {
            comments: {
              where: {
                deletedAt: null,
              },
            },
            votes: true,
          },
        },
        votes: {
          where: {
            userId,
          },
        },
      },
    });

    return result.map((post) => ({
      ...post,
      userHasVoted: post.votes.length > 0,
    }));
  }

  async update(boardId: string, dto: ManageBoardDto) {
    return await this.prisma.board.update({
      where: { id: boardId },
      data: { ...dto },
    });
  }

  async delete(boardId: string): Promise<void> {
    await this.prisma.board.update({
      where: { id: boardId },
      data: { deletedAt: new Date() },
    });
  }
}
