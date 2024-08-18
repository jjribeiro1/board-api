import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/modules/database/prisma/prisma.service';
import { CreateBoardDto } from './dto/create-board.dto';

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
}
