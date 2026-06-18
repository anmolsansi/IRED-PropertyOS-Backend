import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ExportsService } from './exports.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { Roles, Role } from '../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';

@ApiTags('exports')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Roles(Role.ADMIN)
@Controller({ path: 'exports', version: '1' })
export class ExportsController {
  constructor(private readonly exportsService: ExportsService) {}

  @Get()
  @ApiOperation({ summary: 'List all exports' })
  async findAll() {
    return this.exportsService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new export' })
  async create(@Body() body: any, @CurrentUser('id') userId: string) {
    return this.exportsService.create(body, userId);
  }

  @Get(':id/download-url')
  @ApiOperation({ summary: 'Get download URL for export' })
  async getDownloadUrl(@Param('id') id: string) {
    return this.exportsService.getDownloadUrl(id);
  }
}
