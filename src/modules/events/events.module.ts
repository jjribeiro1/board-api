import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BoardsModule } from '../boards/boards.module';
import { OrganizationEventsListener } from './listeners/organization-listener';
import { StatusModule } from '../status/status.module';
import { TagsModule } from '../tags/tags.module';
import { OrganizationsModule } from '../organizations/organizations.module';
import { InviteEventsListener } from './listeners/invite-listener';
import { InvitesModule } from '../invites/invites.module';
import { NotificationEventsListener } from './listeners/notification-listener';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    BoardsModule,
    StatusModule,
    TagsModule,
    OrganizationsModule,
    InvitesModule,
    NotificationsModule,
  ],
  providers: [OrganizationEventsListener, InviteEventsListener, NotificationEventsListener],
})
export class EventsModule {}
