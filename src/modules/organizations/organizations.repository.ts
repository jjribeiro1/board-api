import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/modules/database/prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';

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
}
