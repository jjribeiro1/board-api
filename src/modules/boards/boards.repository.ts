import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/modules/database/prisma/prisma.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { Board } from './entities/board.entity';

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
      },
    });

    if (!result) {
      return null;
    }

    return new Board(
      result.id,
      result.title,
      result.description,
      result.isPrivate,
      result.isLocked,
      result.organizationId,
      result.authorId,
      result.createdAt,
      result.updatedAt,
      null,
    );
  }

  async findPostsFromBoard(boardId: string) {
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
          },
        },
      },
    });

    return result;
  }

  async delete(boardId: string): Promise<void> {
    await this.prisma.board.update({
      where: { id: boardId },
      data: { deletedAt: new Date() },
    });
  }
}
