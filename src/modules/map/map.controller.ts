import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MapService } from './map.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';

@ApiTags('map')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'map', version: '1' })
export class MapController {
  constructor(private readonly mapService: MapService) {}

  @Get('properties')
  @ApiOperation({ summary: 'Get properties within map bounds' })
  async findByBounds(
    @Query('north') north: number,
    @Query('south') south: number,
    @Query('east') east: number,
    @Query('west') west: number,
  ) {
    return this.mapService.findByBounds({ north, south, east, west });
  }

  @Get('properties/nearby')
  @ApiOperation({ summary: 'Get nearby properties' })
  async findNearby(
    @Query('lat') lat: number,
    @Query('lng') lng: number,
    @Query('radius') radius?: number,
  ) {
    return this.mapService.findNearby(lat, lng, radius);
  }
}
