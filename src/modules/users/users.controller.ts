import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { Roles, Role } from '../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';

@ApiTags('users')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'List all users (Admin only)' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('role') role?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.usersService.findAll({ page, limit, role, status, search });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post('invite')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Invite a new worker (Admin only)' })
  async invite(
    @Body()
    body: {
      email: string;
      fullName: string;
      mobileNumber?: string;
      role: Role;
      stateIds?: string[];
      cityIds?: string[];
    },
  ) {
    return this.usersService.invite(body);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update user status (Admin only)' })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: 'active' | 'inactive' | 'suspended' },
  ) {
    return this.usersService.updateStatus(id, body.status);
  }

  @Post(':id/geographic-assignments')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Assign geographic scope to a worker (Admin only)' })
  async assignGeographicScope(
    @Param('id') id: string,
    @Body()
    body: {
      assignments: {
        assignmentType: 'state' | 'city' | 'locality';
        stateId?: string;
        cityId?: string;
        localityId?: string;
      }[];
    },
  ) {
    return this.usersService.assignGeographicScope(id, body.assignments);
  }

  @Post('reassign-units')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Reassign units from one worker to another (Admin only)' })
  async reassignUnits(
    @Body() body: { fromWorkerId: string; toWorkerId: string },
  ) {
    return this.usersService.reassignUnits(body.fromWorkerId, body.toWorkerId);
  }

  @Post(':id/reset-password')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Reset user password (Admin only)' })
  async resetPassword(@Param('id') id: string) {
    return this.usersService.resetPassword(id);
  }
}
