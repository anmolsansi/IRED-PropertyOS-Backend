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
import { DealsService } from './deals.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';

@ApiTags('deals')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'deals', version: '1' })
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  @Get()
  @ApiOperation({ summary: 'List deals' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('assignedTo') assignedTo?: string,
  ) {
    return this.dealsService.findAll({ page, limit, status, assignedTo });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get deal by ID' })
  async findOne(@Param('id') id: string) {
    return this.dealsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new deal' })
  async create(@Body() body: any, @CurrentUser('id') userId: string) {
    return this.dealsService.create(body, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a deal' })
  async update(@Param('id') id: string, @Body() body: any) {
    return this.dealsService.update(id, body);
  }
}
