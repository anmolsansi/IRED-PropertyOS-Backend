import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';

@ApiTags('search')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'search', version: '1' })
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('properties')
  @ApiOperation({ summary: 'Search properties with advanced filters' })
  async searchProperties(
    @Query('stateId') stateId?: string,
    @Query('cityId') cityId?: string,
    @Query('localityId') localityId?: string,
    @Query('propertyTypeId') propertyTypeId?: string,
    @Query('furnishingStatusId') furnishingStatusId?: string,
    @Query('availabilityStatusId') availabilityStatusId?: string,
    @Query('verificationStatusId') verificationStatusId?: string,
    @Query('minArea') minArea?: number,
    @Query('maxArea') maxArea?: number,
    @Query('minRent') minRent?: number,
    @Query('maxRent') maxRent?: number,
    @Query('assignedWorkerId') assignedWorkerId?: string,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.searchService.searchProperties({
      stateId,
      cityId,
      localityId,
      propertyTypeId,
      furnishingStatusId,
      availabilityStatusId,
      verificationStatusId,
      minArea,
      maxArea,
      minRent,
      maxRent,
      assignedWorkerId,
      search,
      page,
      limit,
    });
  }
}
