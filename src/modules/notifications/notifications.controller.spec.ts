import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationsSseService } from './notifications-sse.service';
import { createMockUserPayload } from 'test/factories/user-payload-factory';
import { NotificationType } from 'src/generated/prisma/client';

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let serviceMock: DeepMockProxy<NotificationsService>;
  let sseMock: DeepMockProxy<NotificationsSseService>;

  beforeEach(async () => {
    serviceMock = mockDeep<NotificationsService>();
    sseMock = mockDeep<NotificationsSseService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        {
          provide: NotificationsService,
          useValue: serviceMock,
        },
        {
          provide: NotificationsSseService,
          useValue: sseMock,
        },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated notifications', async () => {
      const user = createMockUserPayload();
      const query = { page: 1, limit: 20 };
      const mockItems = [
        {
          id: 'un-id-1',
          title: 'Novo comentário',
          content: 'John Doe comentou no post "Test Post": This is a test comment',
          type: NotificationType.POST_COMMENTED,
          isRead: false,
          createdAt: new Date(),
        },
      ];

      serviceMock.getUserNotifications.mockResolvedValue({
        items: mockItems as any,
        total: 1,
      });

      const result = await controller.findAll(user, query);

      expect(serviceMock.getUserNotifications).toHaveBeenCalledWith(user.id, 1, 20);
      expect(result).toEqual({
        data: mockItems,
        meta: { total: 1, page: 1, limit: 20 },
      });
    });
  });

  describe('unreadCount', () => {
    it('should return unread count', async () => {
      const user = createMockUserPayload();

      serviceMock.getUnreadCount.mockResolvedValue({ count: 3 });

      const result = await controller.unreadCount(user);

      expect(serviceMock.getUnreadCount).toHaveBeenCalledWith(user.id);
      expect(result).toEqual({ data: { count: 3 } });
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all as read', async () => {
      const user = createMockUserPayload();

      serviceMock.markAllAsRead.mockResolvedValue(undefined);

      await controller.markAllAsRead(user);

      expect(serviceMock.markAllAsRead).toHaveBeenCalledWith(user.id);
    });
  });

  describe('markAsRead', () => {
    it('should mark a notification as read', async () => {
      const user = createMockUserPayload();
      const notificationId = 'un-id-1';

      serviceMock.markAsRead.mockResolvedValue(undefined);

      await controller.markAsRead(notificationId, user);

      expect(serviceMock.markAsRead).toHaveBeenCalledWith(notificationId, user.id);
    });
  });

  describe('dismiss', () => {
    it('should dismiss a notification', async () => {
      const user = createMockUserPayload();
      const notificationId = 'un-id-1';

      serviceMock.dismiss.mockResolvedValue(undefined);

      await controller.dismiss(notificationId, user);

      expect(serviceMock.dismiss).toHaveBeenCalledWith(notificationId, user.id);
    });
  });
});
