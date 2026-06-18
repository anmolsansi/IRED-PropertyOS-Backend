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
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { BuildingsService } from './buildings.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { Roles, Role } from '../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';

@ApiTags('buildings')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'buildings', version: '1' })
export class BuildingsController {
  constructor(private readonly buildingsService: BuildingsService) {}

  @Get()
  @ApiOperation({ summary: 'List buildings with filters' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('stateId') stateId?: string,
    @Query('cityId') cityId?: string,
    @Query('localityId') localityId?: string,
    @Query('propertyTypeId') propertyTypeId?: string,
    @Query('availabilityStatusId') availabilityStatusId?: string,
    @Query('search') search?: string,
  ) {
    return this.buildingsService.findAll({
      page,
      limit,
      stateId,
      cityId,
      localityId,
      propertyTypeId,
      availabilityStatusId,
      search,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get building by ID' })
  async findOne(@Param('id') id: string) {
    return this.buildingsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new building' })
  async create(@Body() body: any, @CurrentUser('id') userId: string) {
    return this.buildingsService.create(body, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a building' })
  async update(
    @Param('id') id: string,
    @Body() body: any,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
  ) {
    return this.buildingsService.update(
      id,
      body,
      userId,
      userRole === Role.ADMIN,
    );
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Soft delete a building (Admin only)' })
  async softDelete(@Param('id') id: string) {
    return this.buildingsService.softDelete(id);
  }

  @Post(':id/restore')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Restore a soft-deleted building (Admin only)' })
  async restore(@Param('id') id: string) {
    return this.buildingsService.restore(id);
  }
}
