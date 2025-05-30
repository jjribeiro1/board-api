import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BoardsModule } from '../boards/boards.module';
import { OrganizationEventsListener } from './listeners/organization-listener';
import { StatusModule } from '../status/status.module';

@Module({
  imports: [EventEmitterModule.forRoot(), BoardsModule, StatusModule],
  providers: [OrganizationEventsListener],
})
export class EventsModule {}
