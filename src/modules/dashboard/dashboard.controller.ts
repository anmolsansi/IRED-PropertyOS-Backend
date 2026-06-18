import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { Roles, Role } from '../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';

@ApiTags('dashboard')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'dashboard', version: '1' })
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('admin')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get admin dashboard metrics' })
  async getAdminDashboard() {
    return this.dashboardService.getAdminDashboard();
  }

  @Get('worker')
  @Roles(Role.WORKER)
  @ApiOperation({ summary: 'Get worker dashboard metrics' })
  async getWorkerDashboard(@CurrentUser('id') userId: string) {
    return this.dashboardService.getWorkerDashboard(userId);
  }

  @Get('activity')
  @ApiOperation({ summary: 'Get recent activity feed' })
  async getActivity(@Query('limit') limit?: number) {
    return this.dashboardService.getActivity(limit);
  }
}
