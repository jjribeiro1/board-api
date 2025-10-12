import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BoardsModule } from '../boards/boards.module';
import { OrganizationEventsListener } from './listeners/organization-listener';
import { StatusModule } from '../status/status.module';
import { TagsModule } from '../tags/tags.module';

@Module({
  imports: [EventEmitterModule.forRoot(), BoardsModule, StatusModule, TagsModule],
  providers: [OrganizationEventsListener],
})
export class EventsModule {}
