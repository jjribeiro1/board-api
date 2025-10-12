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

  async findOne(id: string) {
    const tag = await this.tagsRepository.findOne(id);
    if (!tag) {
      throw new NotFoundException(`Tag com id: ${id} não encontrada`);
    }
    return tag;
  }

  async update(id: string, updateTagDto: UpdateTagDto) {
    await this.findOne(id); // Verifica se a tag existe
    return this.tagsRepository.update(id, updateTagDto);
  }

  async remove(id: string) {
    return await this.tagsRepository.delete(id);
  }
}
