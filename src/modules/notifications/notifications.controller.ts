import { Controller, Delete, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LoggedUser } from 'src/common/decorators/logged-user.decorator';
import { UserPayload } from 'src/common/types/user-payload';
import { NotificationsService } from './notifications.service';
import { PaginateNotificationsDto } from './dto/paginate-notifications.dto';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * List notifications for the logged user (paginated)
   */
  @ApiBearerAuth()
  @Get()
  async findAll(@LoggedUser() user: UserPayload, @Query() query: PaginateNotificationsDto) {
    const result = await this.notificationsService.getUserNotifications(user.id, query.page!, query.limit!);
    return {
      data: result.items,
      meta: {
        total: result.total,
        page: query.page!,
        limit: query.limit!,
      },
    };
  }

  /**
   * Get unread notifications count
   */
  @ApiBearerAuth()
  @Get('unread-count')
  async unreadCount(@LoggedUser() user: UserPayload) {
    const result = await this.notificationsService.getUnreadCount(user.id);
    return { data: result };
  }

  /**
   * Mark all notifications as read
   */
  @ApiBearerAuth()
  @Patch('read-all')
  async markAllAsRead(@LoggedUser() user: UserPayload) {
    await this.notificationsService.markAllAsRead(user.id);
  }

  /**
   * Mark a single notification as read
   */
  @ApiBearerAuth()
  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @LoggedUser() user: UserPayload) {
    await this.notificationsService.markAsRead(id, user.id);
  }

  /**
   * Dismiss (delete) a notification
   */
  @ApiBearerAuth()
  @Delete(':id')
  async dismiss(@Param('id') id: string, @LoggedUser() user: UserPayload) {
    await this.notificationsService.dismiss(id, user.id);
  }
}
