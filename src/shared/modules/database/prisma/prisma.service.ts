import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from 'src/generated/prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(configService: ConfigService) {
    const environment = configService.get('NODE_ENV');
    const isProduction = environment === 'production';
    const adapter = isProduction
      ? new PrismaNeon({ connectionString: configService.get('DATABASE_URL') })
      : new PrismaPg({ connectionString: configService.get('DATABASE_URL') });
    super({ adapter });
  }
}
