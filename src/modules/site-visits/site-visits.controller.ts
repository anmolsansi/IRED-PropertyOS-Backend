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
import { SiteVisitsService } from './site-visits.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';

@ApiTags('site-visits')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'site-visits', version: '1' })
export class SiteVisitsController {
  constructor(private readonly siteVisitsService: SiteVisitsService) {}

  @Get()
  @ApiOperation({ summary: 'List site visits' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('scheduledDate') scheduledDate?: string,
    @Query('assignedTo') assignedTo?: string,
  ) {
    return this.siteVisitsService.findAll({
      page,
      limit,
      scheduledDate,
      assignedTo,
    });
  }

  @Post()
  @ApiOperation({ summary: 'Schedule a new site visit' })
  async create(@Body() body: any, @CurrentUser('id') userId: string) {
    return this.siteVisitsService.create(body, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a site visit' })
  async update(@Param('id') id: string, @Body() body: any) {
    return this.siteVisitsService.update(id, body);
  }
}
