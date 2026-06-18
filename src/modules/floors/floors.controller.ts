import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FloorsService } from './floors.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { Roles, Role } from '../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';

@ApiTags('floors')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'buildings/:buildingId/floors', version: '1' })
export class FloorsController {
  constructor(private readonly floorsService: FloorsService) {}

  @Get()
  @ApiOperation({ summary: 'List floors for a building' })
  async findByBuilding(@Param('buildingId') buildingId: string) {
    return this.floorsService.findByBuilding(buildingId);
  }

  @Post()
  @ApiOperation({ summary: 'Add a floor to a building' })
  async create(
    @Param('buildingId') buildingId: string,
    @Body() body: any,
    @CurrentUser('id') userId: string,
  ) {
    return this.floorsService.create(buildingId, body, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get floor by ID' })
  async findOne(@Param('id') id: string) {
    return this.floorsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a floor' })
  async update(
    @Param('id') id: string,
    @Body() body: any,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
  ) {
    return this.floorsService.update(id, body, userId, userRole === Role.ADMIN);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Soft delete a floor (Admin only)' })
  async softDelete(@Param('id') id: string) {
    return this.floorsService.softDelete(id);
  }

  @Post(':id/restore')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Restore a soft-deleted floor (Admin only)' })
  async restore(@Param('id') id: string) {
    return this.floorsService.restore(id);
  }
}
