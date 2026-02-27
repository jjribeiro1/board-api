import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { NotFoundException } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsRepository } from './notifications.repository';
import { NotificationType } from 'src/generated/prisma/client';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let repositoryMock: DeepMockProxy<NotificationsRepository>;

  beforeEach(async () => {
    repositoryMock = mockDeep<NotificationsRepository>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: NotificationsRepository,
          useValue: repositoryMock,
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

    it('should create a notification with recipients', async () => {
      const recipientUserIds = ['user-id-1', 'user-id-2'];
      const mockNotification = { id: 'notification-id-1' };

      repositoryMock.create.mockResolvedValue(mockNotification as any);

      const result = await service.notify(type, actorId, organizationId, resourceId, payload, recipientUserIds);

      expect(repositoryMock.create).toHaveBeenCalledWith(
        { type, actorId, organizationId, resourceId, payload },
        recipientUserIds,
      );
      expect(result).toEqual(mockNotification);
    });

    it('should return null when no recipients', async () => {
      const result = await service.notify(type, actorId, organizationId, resourceId, payload, []);

      expect(repositoryMock.create).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('getUserNotifications', () => {
    it('should return paginated notifications', async () => {
      const userId = 'user-id-1';
      const mockResult = {
        items: [
          {
            id: 'un-id-1',
            readAt: null,
            createdAt: new Date(),
            notification: {
              id: 'n-id-1',
              type: NotificationType.POST_COMMENTED,
              resourceId: 'post-id-1',
              payload: { postTitle: 'Test' },
              createdAt: new Date(),
              actor: { id: 'actor-id-1', name: 'John' },
              organization: { id: 'org-id-1', name: 'Org' },
            },
          },
        ],
        total: 1,
      };

      repositoryMock.findByUserId.mockResolvedValue(mockResult as any);

      const result = await service.getUserNotifications(userId, 1, 20);

      expect(repositoryMock.findByUserId).toHaveBeenCalledWith(userId, 1, 20);
      expect(result).toEqual(mockResult);
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
