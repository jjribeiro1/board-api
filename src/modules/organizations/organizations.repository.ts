import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/modules/database/prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { Organization } from './entities/organization.entity';

@Injectable()
export class OrganizationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateOrganizationDto, userId: string) {
    const { name, logoUrl } = dto;

    const result = await this.prisma.organization.create({
      data: {
        name,
        logoUrl,
        members: {
          create: {
            role: 'OWNER',
            userId,
          },
        },
      },
    });

    return result.id;
  }

  async findOne(organizationId: string) {
    const result = await this.prisma.organization.findUnique({
      where: { id: organizationId },
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

    return new Organization(
      result.id,
      result.name,
      result.logoUrl,
      result.members,
      result.organizationCustomStatus,
      result.organizationCustomTags,
      result.createdAt,
      result.updatedAt,
    );
  }
}
