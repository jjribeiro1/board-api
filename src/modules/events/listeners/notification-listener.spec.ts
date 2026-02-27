import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { NotificationEventsListener } from './notification-listener';
import { NotificationsService } from 'src/modules/notifications/notifications.service';
import { PostCommentedEventDto, PostStatusChangedEventDto } from '../dto/post-events.dto';
import { NotificationType } from 'src/generated/prisma/client';

describe('NotificationEventsListener', () => {
  let listener: NotificationEventsListener;
  let notificationsServiceMock: DeepMockProxy<NotificationsService>;

  beforeEach(async () => {
    notificationsServiceMock = mockDeep<NotificationsService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationEventsListener,
        {
          provide: NotificationsService,
          useValue: notificationsServiceMock,
        },
      ],
    }).compile();

    listener = module.get<NotificationEventsListener>(NotificationEventsListener);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('handlePostCommented', () => {
    it('should create a notification for the post author', async () => {
      const payload = new PostCommentedEventDto(
        'post-id-1',
        'Test Post',
        'author-id-1',
        'comment-id-1',
        'This is a comment',
        'actor-id-1',
        'Actor Name',
        'org-id-1',
      );

      notificationsServiceMock.notify.mockResolvedValue(undefined as any);

      await listener.handlePostCommented(payload);

      expect(notificationsServiceMock.notify).toHaveBeenCalledWith(
        NotificationType.POST_COMMENTED,
        'actor-id-1',
        'org-id-1',
        'post-id-1',
        {
          postId: 'post-id-1',
          postTitle: 'Test Post',
          commentId: 'comment-id-1',
          commentPreview: 'This is a comment',
          actorName: 'Actor Name',
        },
        ['author-id-1'],
      );
    });

    it('should not notify when actor is the post author', async () => {
      const payload = new PostCommentedEventDto(
        'post-id-1',
        'Test Post',
        'same-user-id',
        'comment-id-1',
        'Self comment',
        'same-user-id',
        'Same User',
        'org-id-1',
      );

      await listener.handlePostCommented(payload);

      expect(notificationsServiceMock.notify).not.toHaveBeenCalled();
    });

    it('should truncate comment content to 100 characters', async () => {
      const longContent = 'A'.repeat(200);
      const payload = new PostCommentedEventDto(
        'post-id-1',
        'Test Post',
        'author-id-1',
        'comment-id-1',
        longContent,
        'actor-id-1',
        'Actor Name',
        'org-id-1',
      );

      notificationsServiceMock.notify.mockResolvedValue(undefined as any);

      await listener.handlePostCommented(payload);

      expect(notificationsServiceMock.notify).toHaveBeenCalledWith(
        NotificationType.POST_COMMENTED,
        'actor-id-1',
        'org-id-1',
        'post-id-1',
        expect.objectContaining({
          commentPreview: 'A'.repeat(100),
        }),
        ['author-id-1'],
      );
    });
  });

  describe('handlePostStatusChanged', () => {
    it('should create a notification for the post author', async () => {
      const payload = new PostStatusChangedEventDto(
        'post-id-1',
        'Test Post',
        'author-id-1',
        'Open',
        'In Progress',
        'actor-id-1',
        'Actor Name',
        'org-id-1',
      );

      notificationsServiceMock.notify.mockResolvedValue(undefined as any);

      await listener.handlePostStatusChanged(payload);

      expect(notificationsServiceMock.notify).toHaveBeenCalledWith(
        NotificationType.POST_STATUS_CHANGED,
        'actor-id-1',
        'org-id-1',
        'post-id-1',
        {
          postId: 'post-id-1',
          postTitle: 'Test Post',
          oldStatusName: 'Open',
          newStatusName: 'In Progress',
          actorName: 'Actor Name',
        },
        ['author-id-1'],
      );
    });

    it('should not notify when actor is the post author', async () => {
      const payload = new PostStatusChangedEventDto(
        'post-id-1',
        'Test Post',
        'same-user-id',
        'Open',
        'In Progress',
        'same-user-id',
        'Same User',
        'org-id-1',
      );

      await listener.handlePostStatusChanged(payload);

      expect(notificationsServiceMock.notify).not.toHaveBeenCalled();
    });
  });
});
