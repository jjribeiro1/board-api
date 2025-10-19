import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/modules/database/prisma/prisma.service';
import { Status } from './entities/status.entity';
import { CreateStatusDto } from './dto/create-status.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@Injectable()
export class StatusRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getAllStatus(organizationId: string) {
    const results = await this.prisma.status.findMany({
      where: {
        organizationId,
        deletedAt: null,
      },
    });
    return results.map(
      (result) =>
        new Status(
          result.id,
          result.name,
          result.color,
          result.organizationId,
          result.createdAt,
          result.updatedAt,
          result.deletedAt,
        ),
    );
  }

  async create(dto: CreateStatusDto) {
    const result = await this.prisma.status.create({
      data: {
        name: dto.name,
        color: dto.color,
        organizationId: dto.organizationId,
      },
    });
    return result;
  }

  async createMany(dto: Array<CreateStatusDto>) {
    await this.prisma.status.createMany({
      data: dto.map((value) => ({ ...value })),
    });
  }

  async update(id: string, dto: UpdateStatusDto) {
    const result = await this.prisma.status.update({
      where: { id },
      data: {
        name: dto.name,
        color: dto.color,
      },
    });
    return result;
  }

  async findOne(id: string) {
    const result = await this.prisma.status.findUnique({
      where: { id, deletedAt: null },
    });
    return result;
  }

  async delete(id: string) {
    await this.prisma.status.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
