import { Controller, Delete, Get, Global, Module, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators';
import type { AuthContext } from '../../common/auth-context';
import { NotificationsService } from './notifications.service';
import { MailService } from './channels/mail.service';
import { WhatsAppService } from './channels/whatsapp.service';
import { RealtimeGateway } from './realtime.gateway';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Notification centre feed for the signed-in user' })
  @ApiQuery({ name: 'unreadOnly', required: false, type: Boolean })
  list(@CurrentUser() user: AuthContext, @Query('unreadOnly') unreadOnly?: string) {
    return this.notifications.list(user.userId, { unreadOnly: unreadOnly === 'true' });
  }

  @Patch(':id/read')
  markRead(@CurrentUser() user: AuthContext, @Param('id') id: string) {
    return this.notifications.markRead(user.userId, id);
  }

  @Post('read-all')
  markAllRead(@CurrentUser() user: AuthContext) {
    return this.notifications.markAllRead(user.userId);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthContext, @Param('id') id: string) {
    return this.notifications.remove(user.userId, id);
  }
}

@Global()
@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, MailService, WhatsAppService, RealtimeGateway],
  exports: [NotificationsService, MailService, WhatsAppService],
})
export class NotificationsModule {}
