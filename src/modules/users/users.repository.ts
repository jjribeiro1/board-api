import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'src/shared/modules/database/prisma/prisma.service';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserDto): Promise<string> {
    const result = await this.prisma.user.create({ data });
    return result.id;
  }

  async findOne(id: string) {
    const result = await this.prisma.user.findUnique({
      where: { id },
      include: {
        organizations: {
          select: { id: true, name: true, role: true },
        },
      },
    });

    if (!result) {
      return null;
    }

    return result;
  }

  async findByEmail(email: string) {
    const result = await this.prisma.user.findUnique({
      where: { email },
      include: {
        organizations: {
          select: { id: true, name: true, role: true },
        },
      },
    });
    if (!result) {
      return null;
    }

    return result;
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
