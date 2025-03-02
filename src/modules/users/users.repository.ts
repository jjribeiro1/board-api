import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { PrismaService } from 'src/shared/modules/database/prisma/prisma.service';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserDto): Promise<string> {
    const result = await this.prisma.user.create({ data });
    return result.id;
  }

  async findOne(id: string) {
    const result = await this.prisma.user.findUnique({ where: { id }, include: { organizations: true } });
    const organizations = result?.organizations
      ? result.organizations.map((data) => ({ organizationId: data.organizationId, role: data.role }))
      : [];
    if (!result) {
      return null;
    }

    return new User(
      result.id,
      result.name,
      result.email,
      result.password,
      organizations,
      result.createdAt,
      result.updatedAt,
      null,
    );
  }

  async findByEmail(email: string) {
    const result = await this.prisma.user.findUnique({ where: { email }, include: { organizations: true } });
    const organizations = result?.organizations
      ? result.organizations.map((data) => ({ organizationId: data.organizationId, role: data.role }))
      : [];
    if (!result) {
      return null;
    }

    return new User(
      result.id,
      result.name,
      result.email,
      result.password,
      organizations,
      result.createdAt,
      result.updatedAt,
      null,
    );
  }

  async organizationsFromUser(userId: string) {
    const result = await this.prisma.organization.findMany({
      where: {
        members: {
          some: {
            userId: userId,
          },
        },
      },
    });

    return result;
  }
}
