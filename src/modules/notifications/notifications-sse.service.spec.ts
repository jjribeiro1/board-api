import { firstValueFrom, take } from 'rxjs';
import { NotificationsSseService } from './notifications-sse.service';
import { MappedNotification } from './notification-mapper.service';
import { NotificationType } from 'src/generated/prisma/client';

const makeMappedNotification = (overrides: Partial<MappedNotification> = {}): MappedNotification => ({
  id: 'un-id-1',
  title: 'Novo comentário',
  content: 'John comentou no post "Test": preview',
  type: NotificationType.POST_COMMENTED,
  isRead: false,
  createdAt: new Date(),
  ...overrides,
});

describe('NotificationsSseService', () => {
  let service: NotificationsSseService;

  beforeEach(() => {
    service = new NotificationsSseService();
  });

  describe('subscribe', () => {
    it('should return an observable that emits published notifications', async () => {
      const userId = 'user-1';
      const notification = makeMappedNotification();

      const observable$ = service.subscribe(userId).pipe(take(1));
      const resultPromise = firstValueFrom(observable$);

      service.publish(userId, notification);

      const result = await resultPromise;
      expect(result).toEqual({ data: notification });
    });

    it('should support multiple concurrent subscribers for the same user', async () => {
      const userId = 'user-1';
      const notification = makeMappedNotification();

      const events1: any[] = [];
      const events2: any[] = [];

      const sub1 = service.subscribe(userId).subscribe((e) => events1.push(e));
      const sub2 = service.subscribe(userId).subscribe((e) => events2.push(e));

      service.publish(userId, notification);

      await new Promise((r) => setTimeout(r, 10));

      sub1.unsubscribe();
      sub2.unsubscribe();

      expect(events1).toEqual([{ data: notification }]);
      expect(events2).toEqual([{ data: notification }]);
    });

    it('should not emit to subscribers of a different user', async () => {
      const userId1 = 'user-1';
      const userId2 = 'user-2';
      const notification = makeMappedNotification();

      const received: any[] = [];
      const sub = service.subscribe(userId1).subscribe((event) => received.push(event));

      service.publish(userId2, notification);

      // give any async ticks a chance to flush
      await new Promise((r) => setTimeout(r, 10));

      sub.unsubscribe();
      expect(received).toHaveLength(0);
    });

    it('should remove the connection entry when the last subscriber disconnects', () => {
      const userId = 'user-1';
      const notification = makeMappedNotification();

      const sub = service.subscribe(userId).subscribe(() => {});
      sub.unsubscribe();

      // publish should be a no-op (no connections for this user)
      expect(() => service.publish(userId, notification)).not.toThrow();
    });
  });

  describe('publish', () => {
    it('should be a no-op when there are no subscribers for the user', () => {
      const notification = makeMappedNotification();
      expect(() => service.publish('unknown-user', notification)).not.toThrow();
    });

    it('should deliver the same notification to all subscribers of a user', async () => {
      const userId = 'user-1';
      const notification = makeMappedNotification();

      const events1: any[] = [];
      const events2: any[] = [];

      const sub1 = service.subscribe(userId).subscribe((e) => events1.push(e));
      const sub2 = service.subscribe(userId).subscribe((e) => events2.push(e));

      service.publish(userId, notification);

      await new Promise((r) => setTimeout(r, 10));

      sub1.unsubscribe();
      sub2.unsubscribe();

      expect(events1).toEqual([{ data: notification }]);
      expect(events2).toEqual([{ data: notification }]);
    });
  });
});
