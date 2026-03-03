import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationType, Prisma } from 'src/generated/prisma/client';
import { NotificationsRepository } from './notifications.repository';
import { NotificationMapperService } from './notification-mapper.service';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly notificationsRepository: NotificationsRepository,
    private readonly notificationMapper: NotificationMapperService,
  ) {}

  async notify(
    type: NotificationType,
    actorId: string | null,
    organizationId: string,
    resourceId: string | null,
    payload: Prisma.InputJsonValue,
    recipientUserIds: string[],
  ) {
    if (recipientUserIds.length === 0) {
      return null;
    }

    return this.notificationsRepository.create(
      { type, actorId, organizationId, resourceId, payload },
      recipientUserIds,
    );
  }

  async getUserNotifications(userId: string, page: number, limit: number) {
    const result = await this.notificationsRepository.findByUserId(userId, page, limit);

    const mappedItems = result.items.map((item) => this.notificationMapper.mapNotification(item));

    return { items: mappedItems, total: result.total };
  }

  async getUnreadCount(userId: string) {
    const count = await this.notificationsRepository.countUnread(userId);
    return { count };
  }

  async markAsRead(userNotificationId: string, userId: string) {
    const result = await this.notificationsRepository.markAsRead(userNotificationId, userId);
    if (result.count === 0) {
      throw new NotFoundException(`notificação com id: ${userNotificationId} não encontrada`);
    }
  }

  async markAllAsRead(userId: string) {
    await this.notificationsRepository.markAllAsRead(userId);
  }

  async dismiss(userNotificationId: string, userId: string) {
    const result = await this.notificationsRepository.delete(userNotificationId, userId);
    if (result.count === 0) {
      throw new NotFoundException(`notificação com id: ${userNotificationId} não encontrada`);
    }
  }
}
