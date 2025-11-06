import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { TagsRepository } from './tags.repository';

@Injectable()
export class TagsService {
  constructor(private readonly tagsRepository: TagsRepository) {}

  async create(createTagDto: CreateTagDto) {
    return this.tagsRepository.create(createTagDto);
  }

  async createDefaultTagsForOrg(organizationId: string) {
    const defaultTags = [
      { name: 'Baixa prioridade', color: '#008000' },
      { name: 'Alta prioridade', color: '#FF0000' },
    ];

    await this.tagsRepository.createMany(
      defaultTags.map((tag) => ({
        ...tag,
        organizationId,
      })),
    );
  }

  async findOne(id: string) {
    const tag = await this.tagsRepository.findOne(id);
    if (!tag) {
      throw new NotFoundException(`Tag com id: ${id} não encontrada`);
    }
    return tag;
  }

  async update(id: string, updateTagDto: UpdateTagDto) {
    await this.findOne(id);
    return this.tagsRepository.update(id, updateTagDto);
  }

  async remove(id: string) {
    return await this.tagsRepository.delete(id);
  }
}
