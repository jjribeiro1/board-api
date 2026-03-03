import { Injectable } from '@nestjs/common';
import { NotificationType, Prisma } from 'src/generated/prisma/client';
import { PrismaService } from 'src/shared/modules/database/prisma/prisma.service';

@Injectable()
export class NotificationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: {
      type: NotificationType;
      actorId: string | null;
      organizationId: string;
      resourceId: string | null;
      payload: Prisma.InputJsonValue;
    },
    recipientUserIds: string[],
  ) {
    return this.prisma.notification.create({
      data: {
        type: data.type,
        actorId: data.actorId,
        organizationId: data.organizationId,
        resourceId: data.resourceId,
        payload: data.payload,
        recipients: {
          create: recipientUserIds.map((userId) => ({
            userId,
          })),
        },
      },
      include: {
        recipients: true,
      },
    });
  }

  async findByUserId(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.userNotification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          readAt: true,
          createdAt: true,
          notification: {
            select: {
              id: true,
              type: true,
              resourceId: true,
              payload: true,
              createdAt: true,
              actor: {
                select: {
                  id: true,
                  name: true,
                },
              },
              organization: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.userNotification.count({ where: { userId } }),
    ]);

    return { items, total };
  }

  async countUnread(userId: string) {
    return this.prisma.userNotification.count({
      where: { userId, readAt: null },
    });
  }

  async markAsRead(userNotificationId: string, userId: string) {
    return this.prisma.userNotification.updateMany({
      where: { id: userNotificationId, userId },
      data: { readAt: new Date() },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.userNotification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
  }

  async delete(userNotificationId: string, userId: string) {
    return this.prisma.userNotification.deleteMany({
      where: { id: userNotificationId, userId },
    });
  }
}
