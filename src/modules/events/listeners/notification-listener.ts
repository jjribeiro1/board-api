import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EVENTS } from 'src/constants/events';
import { NotificationsService } from 'src/modules/notifications/notifications.service';
import { PostCommentedEventDto, PostStatusChangedEventDto } from '../dto/post-events.dto';
import { NotificationType } from 'src/generated/prisma/client';

@Injectable()
export class NotificationEventsListener {
  private readonly logger = new Logger(NotificationEventsListener.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  @OnEvent(EVENTS.post.commented)
  async handlePostCommented(payload: PostCommentedEventDto) {
    const recipients = this.excludeActor([payload.postAuthorId], payload.actorId);

    if (recipients.length === 0) {
      return;
    }

    try {
      await this.notificationsService.notify(
        NotificationType.POST_COMMENTED,
        payload.actorId,
        payload.organizationId,
        payload.postId,
        {
          postId: payload.postId,
          postTitle: payload.postTitle,
          commentId: payload.commentId,
          commentPreview: payload.commentContent.substring(0, 100),
          actorName: payload.actorName,
        },
        recipients,
      );
    } catch (error) {
      this.logger.error(`Erro ao criar notificação POST_COMMENTED: ${error}`);
    }
  }

  @OnEvent(EVENTS.post.statusChanged)
  async handlePostStatusChanged(payload: PostStatusChangedEventDto) {
    const recipients = this.excludeActor([payload.postAuthorId], payload.actorId);

    if (recipients.length === 0) {
      return;
    }

    try {
      await this.notificationsService.notify(
        NotificationType.POST_STATUS_CHANGED,
        payload.actorId,
        payload.organizationId,
        payload.postId,
        {
          postId: payload.postId,
          postTitle: payload.postTitle,
          oldStatusName: payload.oldStatusName,
          newStatusName: payload.newStatusName,
          actorName: payload.actorName,
        },
        recipients,
      );
    } catch (error) {
      this.logger.error(`Erro ao criar notificação POST_STATUS_CHANGED: ${error}`);
    }
  }

  private excludeActor(userIds: string[], actorId: string): string[] {
    return userIds.filter((id) => id !== actorId);
  }
}
