import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { RoadmapRepository } from './roadmap.repository';
import { CreateRoadmapDto } from './dto/create-roadmap.dto';
import { UpdateRoadmapDto } from './dto/update-roadmap.dto';
import { CreateRoadmapColumnDto } from './dto/create-roadmap-column.dto';
import { UpdateRoadmapColumnDto } from './dto/update-roadmap-column.dto';
import { ReorderRoadmapColumnsDto } from './dto/reorder-roadmap-columns.dto';
import { AddPostToRoadmapDto } from './dto/add-post-to-roadmap.dto';
import { ReorderRoadmapItemsDto } from './dto/reorder-roadmap-items.dto';
import { slugify } from 'src/utils/slug';
import { ResourceOwnershipInfo, ResourceOwnershipResolver } from 'src/common/interfaces/resource-info.interface';

@Injectable()
export class RoadmapService implements ResourceOwnershipResolver {
  constructor(private readonly roadmapRepository: RoadmapRepository) {}

  async create(dto: CreateRoadmapDto) {
    const slug = slugify(dto.name);
    return this.roadmapRepository.create(dto, slug);
  }

  async findOne(roadmapId: string) {
    const roadmap = await this.roadmapRepository.findOne(roadmapId);
    if (!roadmap) {
      throw new NotFoundException(`roadmap com id: ${roadmapId} não encontrado`);
    }
    return roadmap;
  }

  async findOneBySlug(slug: string) {
    const roadmap = await this.roadmapRepository.findOneBySlug(slug);
    if (!roadmap) {
      throw new NotFoundException(`roadmap com slug: ${slug} não encontrado`);
    }
    return roadmap;
  }

  async findAllByOrganization(organizationId: string) {
    return this.roadmapRepository.findAllByOrganization(organizationId);
  }

  async update(roadmapId: string, dto: UpdateRoadmapDto) {
    await this.findOne(roadmapId);
    const data: UpdateRoadmapDto = { ...dto };
    if (dto.name) {
      (data as any).slug = slugify(dto.name);
    }
    return this.roadmapRepository.update(roadmapId, data);
  }

  async remove(roadmapId: string) {
    await this.findOne(roadmapId);
    await this.roadmapRepository.softDelete(roadmapId);
  }

  async addColumn(roadmapId: string, dto: CreateRoadmapColumnDto) {
    await this.findOne(roadmapId);
    return this.roadmapRepository.addColumn(roadmapId, dto);
  }

  async findColumn(columnId: string) {
    const column = await this.roadmapRepository.findColumn(columnId);
    if (!column) {
      throw new NotFoundException(`coluna com id: ${columnId} não encontrada`);
    }
    return column;
  }

  async updateColumn(columnId: string, dto: UpdateRoadmapColumnDto) {
    await this.findColumn(columnId);
    return this.roadmapRepository.updateColumn(columnId, dto);
  }

  async deleteColumn(columnId: string) {
    await this.findColumn(columnId);
    await this.roadmapRepository.deleteColumn(columnId);
  }

  async reorderColumns(dto: ReorderRoadmapColumnsDto) {
    await this.roadmapRepository.reorderColumns(dto);
  }

  async addPostToColumn(columnId: string, dto: AddPostToRoadmapDto) {
    const column = await this.findColumn(columnId);

    const existingItem = await this.roadmapRepository.findItemByPostId(dto.postId);
    if (existingItem) {
      throw new ConflictException('este post já está em uma coluna do roadmap');
    }

    return this.roadmapRepository.addPostToColumn(dto, column.id);
  }

  async removePostFromColumn(postId: string) {
    const item = await this.roadmapRepository.findItemByPostId(postId);
    if (!item) {
      throw new NotFoundException('post não encontrado no roadmap');
    }

    await this.roadmapRepository.removePostFromColumn(postId);
  }

  async removeItem(itemId: string) {
    const item = await this.roadmapRepository.findItemById(itemId);
    if (!item) {
      throw new NotFoundException('item do roadmap não encontrado');
    }

    await this.roadmapRepository.removePostFromColumn(item.postId);
  }

  async reorderItems(columnId: string, dto: ReorderRoadmapItemsDto) {
    await this.findColumn(columnId);

    const columnItems = await this.roadmapRepository.findItemsByColumn(columnId);
    const columnItemIds = new Set(columnItems.map((i) => i.id));

    const allBelongToColumn = dto.items.every((item) => columnItemIds.has(item.id));
    if (!allBelongToColumn) {
      throw new BadRequestException('todos os itens devem pertencer à coluna especificada');
    }

    await this.roadmapRepository.reorderItems(dto.items);
  }

  async findOrgAndAuthorId(resourceId: string): Promise<ResourceOwnershipInfo | null> {
    const roadmap = await this.roadmapRepository.findOne(resourceId);
    if (roadmap) {
      return { organizationId: roadmap.organizationId, authorId: null };
    }

    const item = await this.roadmapRepository.findItemById(resourceId);
    if (item) {
      return { organizationId: item.column.roadmap.organizationId, authorId: null };
    }

    const column = await this.roadmapRepository.findColumn(resourceId);
    if (column) {
      const organizationId = await this.roadmapRepository.findOrganizationByRoadmapId(column.roadmapId);
      if (organizationId) {
        return { organizationId, authorId: null };
      }
    }

    return null;
  }
}
