import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/modules/database/prisma/prisma.service';
import { Status } from './entities/status.entity';
import { CreateStatusDto } from './dto/create-status.dto';

@Injectable()
export class StatusRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getAllStatus(organizationId: string) {
    const results = await this.prisma.status.findMany({
      where: {
        organizationId,
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

  async createMany(dto: Array<CreateStatusDto>) {
    await this.prisma.status.createMany({
      data: dto.map((value) => ({ ...value, color: '#FAFAFA' })),
    });
  }
}
