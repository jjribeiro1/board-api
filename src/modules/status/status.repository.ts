import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/modules/database/prisma/prisma.service';
import { Status } from './entities/status.entity';

@Injectable()
export class StatusRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getAllStatus(organizationId: string | null) {
    const results = await this.prisma.status.findMany({
      where: {
        ...(organizationId
          ? {
              organizationId,
              isSystemDefault: false,
            }
          : {
              isSystemDefault: true,
            }),
      },
      orderBy: {
        order: 'asc',
      },
    });
    return results.map(
      (result) =>
        new Status(
          result.id,
          result.name,
          result.color,
          result.isSystemDefault,
          result.order,
          result.organizationId,
          result.createdAt,
          result.updatedAt,
          result.deletedAt,
        ),
    );
  }
}
