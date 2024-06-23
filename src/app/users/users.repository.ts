import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserDto): Promise<string> {
    const result = await this.prisma.user.create({ data });
    return result.id;
  }

  async findOne(id: string) {
    const result = await this.prisma.user.findUnique({ where: { id } });

    if (!result) {
      return null;
    }

    return new User(
      result.id,
      result.name,
      result.email,
      result.password,
      result.createdAt,
      result.updatedAt,
    );
  }
}
