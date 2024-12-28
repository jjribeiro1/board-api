import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/modules/database/prisma/prisma.service';

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
    });
    return results;
  }
}
