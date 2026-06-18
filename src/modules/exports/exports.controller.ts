import { Controller, Get, Post, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ExportsService } from './exports.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { Roles, Role } from '../../shared/decorators/roles.decorator';

@ApiTags('exports')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Roles(Role.ADMIN)
@Controller({ path: 'exports', version: '1' })
export class ExportsController {
  constructor(private readonly exportsService: ExportsService) {}

  @Get(':entityType')
  @ApiOperation({ summary: 'Export data as CSV-ready JSON' })
  async export(
    @Param('entityType') entityType: string,
    @Query('stateId') stateId?: string,
    @Query('cityId') cityId?: string,
    @Query('buildingId') buildingId?: string,
  ) {
    const filters: Record<string, any> = {};
    if (stateId) filters.stateId = stateId;
    if (cityId) filters.cityId = cityId;
    if (buildingId) filters.buildingId = buildingId;

    return this.exportsService.getExportableData(entityType, filters);
  }
}
