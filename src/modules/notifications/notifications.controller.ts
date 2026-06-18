import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { Roles, Role } from '../../shared/decorators/roles.decorator';

@ApiTags('notifications')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'notifications', version: '1' })
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('stats')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get queue stats' })
  async getStats() {
    return this.notificationsService.getQueueStats();
  }

  @Post('retry/:queue')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Retry failed jobs in a queue' })
  async retryFailed(@Param('queue') queue: 'email' | 'sms') {
    return this.notificationsService.retryFailed(queue);
  }
}
