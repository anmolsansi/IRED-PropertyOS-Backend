import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MapService } from './map.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation.pipe';
import {
  BoundsQuerySchema,
  NearbyQuerySchema,
  BoundsQueryDto,
  NearbyQueryDto,
} from './dto/map.schema';

@ApiTags('map')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'map', version: '1' })
export class MapController {
  constructor(private readonly mapService: MapService) {}

  @Get('properties')
  @ApiOperation({ summary: 'Get properties within map bounds' })
  @UsePipes(new ZodValidationPipe(BoundsQuerySchema))
  async findByBounds(@Query() query: BoundsQueryDto) {
    return this.mapService.findByBounds(query);
  }

  @Get('properties/nearby')
  @ApiOperation({ summary: 'Get nearby properties' })
  @UsePipes(new ZodValidationPipe(NearbyQuerySchema))
  async findNearby(@Query() query: NearbyQueryDto) {
    return this.mapService.findNearby(query.lat, query.lng, query.radius);
  }
}
