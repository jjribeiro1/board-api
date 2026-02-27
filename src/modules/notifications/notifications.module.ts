import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationsRepository } from './notifications.repository';
import { NotificationMapperService } from './notification-mapper.service';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsRepository, NotificationMapperService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
