import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BoardsModule } from '../boards/boards.module';
import { OrganizationEventsListener } from './listeners/organization-listener';

@Module({
  imports: [EventEmitterModule.forRoot(), BoardsModule],
  providers: [OrganizationEventsListener],
})
export class EventsModule {}
