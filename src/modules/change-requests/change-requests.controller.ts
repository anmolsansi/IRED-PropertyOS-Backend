import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ChangeRequestsService } from './change-requests.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { Roles, Role } from '../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';

@ApiTags('change-requests')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'change-requests', version: '1' })
export class ChangeRequestsController {
  constructor(
    private readonly changeRequestsService: ChangeRequestsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List change requests' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('entityType') entityType?: string,
    @Query('cityId') cityId?: string,
  ) {
    return this.changeRequestsService.findAll({
      page,
      limit,
      status,
      entityType,
      cityId,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get change request by ID' })
  async findOne(@Param('id') id: string) {
    return this.changeRequestsService.findOne(id);
  }

  @Post(':id/withdraw')
  @ApiOperation({ summary: 'Withdraw a pending change request' })
  async withdraw(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.changeRequestsService.withdraw(id, userId);
  }

  @Post(':id/approve-items')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Approve selected items in a change request' })
  async approveItems(
    @Param('id') id: string,
    @Body()
    body: {
      items: { changeItemId: string; finalValue: string; comment?: string }[];
    },
    @CurrentUser('id') adminId: string,
  ) {
    return this.changeRequestsService.approveItems(id, body.items, adminId);
  }

  @Post(':id/reject-items')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Reject selected items in a change request' })
  async rejectItems(
    @Param('id') id: string,
    @Body()
    body: {
      items: { changeItemId: string; comment: string }[];
    },
    @CurrentUser('id') adminId: string,
  ) {
    return this.changeRequestsService.rejectItems(id, body.items, adminId);
  }

  @Post(':id/resolve-conflict')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Resolve a conflict in a change request' })
  async resolveConflict(
    @Param('id') id: string,
    @Body()
    body: {
      changeItemId: string;
      finalValue: string;
    },
    @CurrentUser('id') adminId: string,
  ) {
    return this.changeRequestsService.resolveConflict(
      id,
      body.changeItemId,
      body.finalValue,
      adminId,
    );
  }
}
