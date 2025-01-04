import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/modules/database/prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { ListPostsQueryDto } from './dto/list-post-query.dto';
import { Organization } from './entities/organization.entity';
import { Board } from '../boards/entities/board.entity';

@Injectable()
export class OrganizationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateOrganizationDto, userId: string) {
    const { name, logoUrl } = dto;

    const result = await this.prisma.organization.create({
      data: {
        name,
        logoUrl,
        members: {
          create: {
            role: 'OWNER',
            userId,
          },
        },
      },
    });

    return result.id;
  }

  async findOne(organizationId: string) {
    const result = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        members: true,
        organizationCustomStatus: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        organizationCustomTags: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });

    if (!result) {
      return null;
    }

    return new Organization(
      result.id,
      result.name,
      result.logoUrl,
      result.members,
      result.organizationCustomStatus,
      result.organizationCustomTags,
      result.createdAt,
      result.updatedAt,
      null,
    );
  }

  async findBoardsFromOrganization(organizationId: string) {
    const results = await this.prisma.board.findMany({
      where: {
        organizationId,
        deletedAt: null,
      },
    });

    return results.map(
      (board) =>
        new Board(
          board.id,
          board.title,
          board.description,
          board.isPrivate,
          board.isLocked,
          board.organizationId,
          board.authorId,
          board.createdAt,
          board.updatedAt,
          board.deletedAt,
        ),
    );
  }

  async findPostsFromOrganization(organizationId: string, filters: ListPostsQueryDto) {
    const results = await this.prisma.post.findMany({
      orderBy: {
        status: {
          order: 'asc',
        },
      },
      where: {
        board: {
          id: filters.board,
          organizationId: organizationId,
        },
        statusId: filters.status,
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        board: {
          select: {
            id: true,
            title: true,
          },
        },
        status: {
          select: {
            id: true,
            name: true,
            color: true,
            order: true,
          },
        },
        tags: {
          select: {
            tag: {
              select: {
                id: true,
                name: true,
                color: true,
              },
            },
          },
        },
      },
    });

    return results;
  }
}
