import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { NotFoundException } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsRepository } from './notifications.repository';
import { NotificationMapperService } from './notification-mapper.service';
import { NotificationsSseService } from './notifications-sse.service';
import { NotificationType } from 'src/generated/prisma/client';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let repositoryMock: DeepMockProxy<NotificationsRepository>;
  let mapperMock: DeepMockProxy<NotificationMapperService>;
  let sseMock: DeepMockProxy<NotificationsSseService>;

  beforeEach(async () => {
    repositoryMock = mockDeep<NotificationsRepository>();
    mapperMock = mockDeep<NotificationMapperService>();
    sseMock = mockDeep<NotificationsSseService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: NotificationsRepository,
          useValue: repositoryMock,
        },
        {
          provide: NotificationMapperService,
          useValue: mapperMock,
        },
        {
          provide: NotificationsSseService,
          useValue: sseMock,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('notify', () => {
    const type = NotificationType.POST_COMMENTED;
    const actorId = 'actor-id-1';
    const organizationId = 'org-id-1';
    const resourceId = 'post-id-1';
    const payload = { postTitle: 'Test Post', actorName: 'John Doe' };

    it('should create a notification with recipients and publish SSE events', async () => {
      const recipientUserIds = ['user-id-1', 'user-id-2'];
      const createdAt = new Date();
      const mockNotification = {
        id: 'notification-id-1',
        recipients: [
          { id: 'un-id-1', userId: 'user-id-1', createdAt },
          { id: 'un-id-2', userId: 'user-id-2', createdAt },
        ],
      };
      const mappedNotification = {
        id: 'un-id-1',
        title: 'Novo comentário',
        content: 'preview',
        type,
        isRead: false,
        createdAt,
      };

      repositoryMock.create.mockResolvedValue(mockNotification as any);
      mapperMock.mapNotification.mockReturnValue(mappedNotification);

      const result = await service.notify(type, actorId, organizationId, resourceId, payload, recipientUserIds);

      expect(repositoryMock.create).toHaveBeenCalledWith(
        { type, actorId, organizationId, resourceId, payload },
        recipientUserIds,
      );
      expect(mapperMock.mapNotification).toHaveBeenCalledTimes(2);
      expect(sseMock.publish).toHaveBeenCalledTimes(2);
      expect(sseMock.publish).toHaveBeenCalledWith('user-id-1', mappedNotification);
      expect(sseMock.publish).toHaveBeenCalledWith('user-id-2', mappedNotification);
      expect(result).toEqual(mockNotification);
    });

    it('should return null when no recipients', async () => {
      const result = await service.notify(type, actorId, organizationId, resourceId, payload, []);

      expect(repositoryMock.create).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('getUserNotifications', () => {
    it('should return paginated notifications with mapped format for POST_COMMENTED', async () => {
      const userId = 'user-id-1';
      const createdAt = new Date();
      const mockResult = {
        items: [
          {
            id: 'un-id-1',
            readAt: null,
            createdAt,
            notification: {
              id: 'n-id-1',
              type: NotificationType.POST_COMMENTED,
              resourceId: 'post-id-1',
              payload: {
                postTitle: 'Test Post',
                actorName: 'John Doe',
                commentPreview: 'This is a test comment',
              },
              createdAt: new Date(),
              actor: { id: 'actor-id-1', name: 'John' },
              organization: { id: 'org-id-1', name: 'Org' },
            },
          },
        ],
        total: 1,
      };

      const mappedItem = {
        id: 'un-id-1',
        title: 'Novo comentário',
        content: 'John Doe comentou no post "Test Post": This is a test comment',
        type: NotificationType.POST_COMMENTED,
        isRead: false,
        createdAt,
      };

      repositoryMock.findByUserId.mockResolvedValue(mockResult as any);
      mapperMock.mapNotification.mockReturnValue(mappedItem);

      const result = await service.getUserNotifications(userId, 1, 20);

      expect(repositoryMock.findByUserId).toHaveBeenCalledWith(userId, 1, 20);
      expect(mapperMock.mapNotification).toHaveBeenCalledWith(mockResult.items[0]);
      expect(result).toEqual({
        items: [mappedItem],
        total: 1,
      });
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread count', async () => {
      const userId = 'user-id-1';

      repositoryMock.countUnread.mockResolvedValue(5);

      const result = await service.getUnreadCount(userId);

      expect(repositoryMock.countUnread).toHaveBeenCalledWith(userId);
      expect(result).toEqual({ count: 5 });
    });
  });

  describe('markAsRead', () => {
    it('should mark a notification as read', async () => {
      const userNotificationId = 'un-id-1';
      const userId = 'user-id-1';

      repositoryMock.markAsRead.mockResolvedValue({ count: 1 } as any);

      await service.markAsRead(userNotificationId, userId);

      expect(repositoryMock.markAsRead).toHaveBeenCalledWith(userNotificationId, userId);
    });

    it('should throw NotFoundException when notification not found', async () => {
      const userNotificationId = 'non-existent-id';
      const userId = 'user-id-1';

      repositoryMock.markAsRead.mockResolvedValue({ count: 0 } as any);

      await expect(service.markAsRead(userNotificationId, userId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      const userId = 'user-id-1';

      repositoryMock.markAllAsRead.mockResolvedValue({ count: 3 } as any);

      await service.markAllAsRead(userId);

      expect(repositoryMock.markAllAsRead).toHaveBeenCalledWith(userId);
    });
  });

  describe('dismiss', () => {
    it('should delete a notification', async () => {
      const userNotificationId = 'un-id-1';
      const userId = 'user-id-1';

      repositoryMock.delete.mockResolvedValue({ count: 1 } as any);

      await service.dismiss(userNotificationId, userId);

      expect(repositoryMock.delete).toHaveBeenCalledWith(userNotificationId, userId);
    });

    it('should throw NotFoundException when notification not found', async () => {
      const userNotificationId = 'non-existent-id';
      const userId = 'user-id-1';

      repositoryMock.delete.mockResolvedValue({ count: 0 } as any);

      await expect(service.dismiss(userNotificationId, userId)).rejects.toThrow(NotFoundException);
    });
  });
});
