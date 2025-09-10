import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/modules/database/prisma/prisma.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Injectable()
export class TagsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTagDto) {
    const result = await this.prisma.tag.create({
      data: {
        ...dto,
        isSystemDefault: dto.organizationId ? false : true,
      },
    });
    return result.id;
  }

  async findOne(tagId: string) {
    const result = await this.prisma.tag.findUnique({
      where: {
        id: tagId,
        deletedAt: null,
      },
    });

    if (!result) {
      return null;
    }

    return result;
  }

  async update(tagId: string, dto: UpdateTagDto) {
    const result = await this.prisma.tag.update({
      where: { id: tagId },
      data: {
        ...dto,
      },
    });

    return result;
  }

  async delete(tagId: string) {
    await this.prisma.tag.update({
      where: { id: tagId },
      data: { deletedAt: new Date() },
    });
  }
}
