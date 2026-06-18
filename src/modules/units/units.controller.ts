import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UnitsService } from './units.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { Roles, Role } from '../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';

@ApiTags('units')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'units', version: '1' })
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @Get()
  @ApiOperation({ summary: 'List units with filters' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('buildingId') buildingId?: string,
    @Query('floorId') floorId?: string,
    @Query('availabilityStatusId') availabilityStatusId?: string,
    @Query('search') search?: string,
  ) {
    return this.unitsService.findAll({
      page,
      limit,
      buildingId,
      floorId,
      availabilityStatusId,
      search,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get unit by ID' })
  async findOne(@Param('id') id: string) {
    return this.unitsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new unit' })
  async create(@Body() body: any, @CurrentUser('id') userId: string) {
    return this.unitsService.create(body, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a unit' })
  async update(
    @Param('id') id: string,
    @Body() body: any,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
  ) {
    return this.unitsService.update(id, body, userId, userRole === Role.ADMIN);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Soft delete a unit (Admin only)' })
  async softDelete(@Param('id') id: string) {
    return this.unitsService.softDelete(id);
  }

  @Post(':id/restore')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Restore a soft-deleted unit (Admin only)' })
  async restore(@Param('id') id: string) {
    return this.unitsService.restore(id);
  }
}
