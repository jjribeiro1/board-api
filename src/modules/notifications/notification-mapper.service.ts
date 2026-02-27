import { Injectable } from '@nestjs/common';
import { NotificationType } from 'src/generated/prisma/client';

export interface MappedNotification {
  id: string;
  title: string;
  content: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: Date;
}

interface UserNotificationItem {
  id: string;
  readAt: Date | null;
  createdAt: Date;
  notification: {
    type: NotificationType;
    payload: any;
  };
}

@Injectable()
export class NotificationMapperService {
  mapNotification(item: UserNotificationItem): MappedNotification {
    const { id, readAt, createdAt, notification } = item;
    const payload = notification.payload as any;

    let title = '';
    let content = '';

    switch (notification.type) {
      case NotificationType.POST_COMMENTED:
        title = this.getPostCommentedTitle();
        content = this.getPostCommentedContent(payload);
        break;

      case NotificationType.POST_STATUS_CHANGED:
        title = this.getPostStatusChangedTitle();
        content = this.getPostStatusChangedContent(payload);
        break;

      default:
        title = 'Notificação';
        content = 'Você tem uma nova notificação';
    }

    return {
      id,
      title,
      content,
      type: notification.type,
      isRead: readAt !== null,
      createdAt,
    };
  }

  private getPostCommentedTitle(): string {
    return 'Novo comentário';
  }

  private getPostCommentedContent(payload: any): string {
    const { actorName, postTitle, commentPreview } = payload;
    return `${actorName} comentou no post "${postTitle}": ${commentPreview}`;
  }

  private getPostStatusChangedTitle(): string {
    return 'Status atualizado';
  }

  private getPostStatusChangedContent(payload: any): string {
    const { actorName, postTitle, oldStatusName, newStatusName } = payload;
    return `${actorName} alterou o status do post "${postTitle}" de "${oldStatusName}" para "${newStatusName}"`;
  }
}
