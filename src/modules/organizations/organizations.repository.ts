import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/modules/database/prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { ListPostsQueryDto } from './dto/list-post-query.dto';

@Injectable()
export class OrganizationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateOrganizationDto, slug: string, userId: string) {
    const { name, logoUrl } = dto;

    const result = await this.prisma.organization.create({
      data: {
        name,
        slug,
        logoUrl,
        members: {
          create: {
            role: 'OWNER',
            name,
            userId,
          },
        },
      },
    });

    return result.id;
  }

  async findOne(organizationId: string) {
    const result = await this.prisma.organization.findUnique({
      where: { id: organizationId, deletedAt: null },
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

    return result;
  }

  async findBoardsFromOrganization(organizationId: string) {
    const results = await this.prisma.board.findMany({
      where: {
        organizationId,
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        description: true,
        isPrivate: true,
        isLocked: true,
        organizationId: true,
        authorId: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
        _count: {
          select: {
            posts: {
              where: {
                deletedAt: null,
              },
            },
          },
        },
      },
    });

    return results;
  }

  async findPostsFromOrganization(organizationId: string, filters: ListPostsQueryDto) {
    const results = await this.prisma.post.findMany({
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      where: {
        deletedAt: null,
        statusId: filters.status,
        board: {
          id: filters.board,
          organizationId: organizationId,
          deletedAt: null,
        },
      },
      select: {
        id: true,
        title: true,
        isPinned: true,
        description: true,
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
          },
        },
        tags: {
          where: {
            tag: {
              deletedAt: null,
            },
          },
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
        author: {
          select: {
            id: true,
            name: true,
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
      },
    });

    return results.map((post) => ({
      ...post,
      tags: post.tags.map((t) => t.tag),
    }));
  }

  async findMembersFromOrganization(organizationId: string) {
    const results = await this.prisma.userOrganization.findMany({
      where: {
        organizationId,
        deletedAt: null,
      },
      select: {
        id: true,
        userId: true,
        name: true,
        role: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return results;
  }

  async findTagsFromOrganization(organizationId: string) {
    const results = await this.prisma.tag.findMany({
      where: {
        organizationId,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    return results;
  }

  async findStatusFromOrganization(organizationId: string) {
    const results = await this.prisma.status.findMany({
      where: {
        organizationId,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    return results;
  }

  async setDefaultStatus(organizationId: string, statusId: string) {
    await this.prisma.organization.update({
      where: { id: organizationId },
      data: { defaultStatusId: statusId },
    });
  }
}
