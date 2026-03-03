import { Injectable } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { MappedNotification } from './notification-mapper.service';

export interface SseMessageEvent {
  data: MappedNotification | { type: 'heartbeat' };
}

@Injectable()
export class NotificationsSseService {
  private readonly connections = new Map<string, Set<Subject<SseMessageEvent>>>();

  subscribe(userId: string): Observable<SseMessageEvent> {
    const subject = new Subject<SseMessageEvent>();

    if (!this.connections.has(userId)) {
      this.connections.set(userId, new Set());
    }
    this.connections.get(userId)!.add(subject);

    return subject.asObservable().pipe(
      finalize(() => {
        const subjects = this.connections.get(userId);
        if (subjects) {
          subjects.delete(subject);
          if (subjects.size === 0) {
            this.connections.delete(userId);
          }
        }
      }),
    );
  }

  publish(userId: string, notification: MappedNotification): void {
    const subjects = this.connections.get(userId);
    if (!subjects || subjects.size === 0) {
      return;
    }
    const event: SseMessageEvent = { data: notification };
    subjects.forEach((subject) => subject.next(event));
  }
}
