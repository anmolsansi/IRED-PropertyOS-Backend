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
  UsePipes,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SiteVisitsService } from './site-visits.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { Roles, Role } from '../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation.pipe';
import {
  CreateSiteVisitSchema,
  UpdateSiteVisitSchema,
  SiteVisitQuerySchema,
  CompleteSiteVisitSchema,
  CreateSiteVisitDto,
  UpdateSiteVisitDto,
  SiteVisitQueryDto,
  CompleteSiteVisitDto,
} from './dto/site-visits.schema';

@ApiTags('site-visits')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'site-visits', version: '1' })
export class SiteVisitsController {
  constructor(private readonly siteVisitsService: SiteVisitsService) {}

  @Get()
  @ApiOperation({ summary: 'List site visits' })
  @UsePipes(new ZodValidationPipe(SiteVisitQuerySchema))
  async findAll(@Query() query: SiteVisitQueryDto) {
    return this.siteVisitsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get site visit by ID' })
  async findOne(@Param('id') id: string) {
    return this.siteVisitsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Schedule a new site visit' })
  @UsePipes(new ZodValidationPipe(CreateSiteVisitSchema))
  async create(@Body() dto: CreateSiteVisitDto, @CurrentUser('id') userId: string) {
    return this.siteVisitsService.create(dto, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a site visit' })
  @UsePipes(new ZodValidationPipe(UpdateSiteVisitSchema))
  async update(@Param('id') id: string, @Body() dto: UpdateSiteVisitDto) {
    return this.siteVisitsService.update(id, dto);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Mark site visit as completed' })
  @UsePipes(new ZodValidationPipe(CompleteSiteVisitSchema))
  async complete(
    @Param('id') id: string,
    @Body() dto: CompleteSiteVisitDto,
  ) {
    return this.siteVisitsService.complete(id, dto.notes);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel a site visit' })
  async cancel(@Param('id') id: string) {
    return this.siteVisitsService.cancel(id);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Soft delete a site visit (Admin only)' })
  async softDelete(@Param('id') id: string) {
    return this.siteVisitsService.softDelete(id);
  }

  @Post(':id/restore')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Restore a soft-deleted site visit (Admin only)' })
  async restore(@Param('id') id: string) {
    return this.siteVisitsService.restore(id);
  }
}
