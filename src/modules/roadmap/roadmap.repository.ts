import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/modules/database/prisma/prisma.service';
import { CreateRoadmapDto } from './dto/create-roadmap.dto';
import { UpdateRoadmapDto } from './dto/update-roadmap.dto';
import { CreateRoadmapColumnDto } from './dto/create-roadmap-column.dto';
import { UpdateRoadmapColumnDto } from './dto/update-roadmap-column.dto';
import { AddPostToRoadmapDto } from './dto/add-post-to-roadmap.dto';
import { RoadmapItemOrder } from './dto/reorder-roadmap-items.dto';
import { ReorderRoadmapColumnsDto } from './dto/reorder-roadmap-columns.dto';

@Injectable()
export class RoadmapRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRoadmapDto, slug: string) {
    const { name, description, organizationId } = dto;
    const result = await this.prisma.roadmap.create({
      data: { name, description, slug, organizationId },
    });
    return result.id;
  }

  async findOne(roadmapId: string) {
    return this.prisma.roadmap.findUnique({
      where: { id: roadmapId, deletedAt: null },
      include: {
        columns: {
          where: { deletedAt: null },
          orderBy: { order: 'asc' },
          include: {
            items: {
              orderBy: { order: 'asc' },
              include: {
                post: {
                  select: {
                    id: true,
                    title: true,
                    author: { select: { id: true, name: true } },
                    _count: { select: { votes: true, comments: true } },
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async findOneBySlug(slug: string) {
    return this.prisma.roadmap.findUnique({
      where: { slug, deletedAt: null },
      include: {
        columns: {
          where: { deletedAt: null },
          orderBy: { order: 'asc' },
          include: {
            items: {
              orderBy: { order: 'asc' },
              include: {
                post: {
                  select: {
                    id: true,
                    title: true,
                    author: { select: { id: true, name: true } },
                    _count: { select: { votes: true, comments: true } },
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async findAllByOrganization(organizationId: string) {
    return this.prisma.roadmap.findMany({
      where: { organizationId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: {
        columns: {
          where: { deletedAt: null },
          orderBy: { order: 'asc' },
          include: {
            items: {
              orderBy: { order: 'asc' },
              include: {
                post: {
                  select: {
                    id: true,
                    title: true,
                    author: { select: { id: true, name: true } },
                    _count: { select: { votes: true, comments: true } },
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async update(roadmapId: string, dto: UpdateRoadmapDto) {
    return this.prisma.roadmap.update({
      where: { id: roadmapId },
      data: { ...dto },
    });
  }

  async softDelete(roadmapId: string) {
    await this.prisma.roadmap.update({
      where: { id: roadmapId },
      data: { deletedAt: new Date() },
    });
  }

  async addColumn(roadmapId: string, dto: CreateRoadmapColumnDto) {
    const result = await this.prisma.roadmapColumn.create({
      data: { roadmapId, ...dto },
    });
    return result.id;
  }

  async findColumn(columnId: string) {
    return this.prisma.roadmapColumn.findUnique({
      where: { id: columnId, deletedAt: null },
    });
  }

  async updateColumn(columnId: string, dto: UpdateRoadmapColumnDto) {
    return this.prisma.roadmapColumn.update({
      where: { id: columnId },
      data: { ...dto },
    });
  }

  async deleteColumn(columnId: string) {
    await this.prisma.roadmapColumn.update({
      where: { id: columnId },
      data: { deletedAt: new Date() },
    });
  }

  async reorderColumns(dto: ReorderRoadmapColumnsDto) {
    await this.prisma.$transaction(
      dto.columns.map((col) =>
        this.prisma.roadmapColumn.update({
          where: { id: col.id },
          data: { order: col.order },
        }),
      ),
    );
  }

  async addPostToColumn(dto: AddPostToRoadmapDto, columnId: string) {
    const result = await this.prisma.roadmapItem.create({
      data: {
        postId: dto.postId,
        columnId,
        order: dto.order ?? 0,
      },
    });
    return result.id;
  }

  async removePostFromColumn(postId: string) {
    await this.prisma.roadmapItem.delete({
      where: { postId },
    });
  }

  async findItemByPostId(postId: string) {
    return this.prisma.roadmapItem.findUnique({
      where: { postId },
    });
  }

  async findItemById(itemId: string) {
    return this.prisma.roadmapItem.findUnique({
      where: { id: itemId },
      include: {
        column: {
          include: {
            roadmap: {
              select: { organizationId: true },
            },
          },
        },
      },
    });
  }

  async reorderItems(items: RoadmapItemOrder[]) {
    await this.prisma.$transaction(
      items.map((item) =>
        this.prisma.roadmapItem.update({
          where: { id: item.id },
          data: { order: item.order },
        }),
      ),
    );
  }

  async findItemsByColumn(columnId: string) {
    return this.prisma.roadmapItem.findMany({
      where: { columnId },
    });
  }

  async findOrganizationByRoadmapId(roadmapId: string) {
    const roadmap = await this.prisma.roadmap.findUnique({
      where: { id: roadmapId },
      select: { organizationId: true },
    });
    return roadmap?.organizationId ?? null;
  }
}
