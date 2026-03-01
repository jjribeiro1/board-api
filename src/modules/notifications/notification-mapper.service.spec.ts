import { Test, TestingModule } from '@nestjs/testing';
import { NotificationMapperService } from './notification-mapper.service';
import { NotificationType } from 'src/generated/prisma/client';

describe('NotificationMapperService', () => {
  let service: NotificationMapperService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationMapperService],
    }).compile();

    service = module.get<NotificationMapperService>(NotificationMapperService);
  });

  describe('mapNotification', () => {
    describe('POST_COMMENTED', () => {
      it('should map POST_COMMENTED notification correctly', () => {
        const createdAt = new Date();
        const item = {
          id: 'un-id-1',
          readAt: null,
          createdAt,
          notification: {
            type: NotificationType.POST_COMMENTED,
            payload: {
              postTitle: 'Test Post',
              actorName: 'John Doe',
              commentPreview: 'This is a test comment',
            },
          },
        };

        const result = service.mapNotification(item as any);

        expect(result).toEqual({
          id: 'un-id-1',
          title: 'Novo comentário',
          content: 'John Doe comentou no post "Test Post": This is a test comment',
          type: NotificationType.POST_COMMENTED,
          isRead: false,
          createdAt,
        });
      });

      it('should mark as read when readAt is not null', () => {
        const createdAt = new Date();
        const readAt = new Date();
        const item = {
          id: 'un-id-1',
          readAt,
          createdAt,
          notification: {
            type: NotificationType.POST_COMMENTED,
            payload: {
              postTitle: 'Test Post',
              actorName: 'John Doe',
              commentPreview: 'This is a test comment',
            },
          },
        };

        const result = service.mapNotification(item as any);

        expect(result.isRead).toBe(true);
      });
    });

    describe('POST_STATUS_CHANGED', () => {
      it('should map POST_STATUS_CHANGED notification correctly', () => {
        const createdAt = new Date();
        const item = {
          id: 'un-id-2',
          readAt: null,
          createdAt,
          notification: {
            type: NotificationType.POST_STATUS_CHANGED,
            payload: {
              postTitle: 'Feature Request',
              actorName: 'Jane Smith',
              oldStatusName: 'Pendente',
              newStatusName: 'Em Progresso',
            },
          },
        };

        const result = service.mapNotification(item as any);

        expect(result).toEqual({
          id: 'un-id-2',
          title: 'Status atualizado',
          content: 'Jane Smith alterou o status do post "Feature Request" de "Pendente" para "Em Progresso"',
          type: NotificationType.POST_STATUS_CHANGED,
          isRead: false,
          createdAt,
        });
      });
    });

    describe('Unknown type', () => {
      it('should handle unknown notification type with default text', () => {
        const createdAt = new Date();
        const item = {
          id: 'un-id-3',
          readAt: null,
          createdAt,
          notification: {
            type: 'UNKNOWN_TYPE' as any,
            payload: {},
          },
        };

        const result = service.mapNotification(item as any);

        expect(result).toEqual({
          id: 'un-id-3',
          title: 'Notificação',
          content: 'Você tem uma nova notificação',
          type: 'UNKNOWN_TYPE',
          isRead: false,
          createdAt,
        });
      });
    });
  });
});
