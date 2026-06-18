import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ImportsService } from './imports.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { Roles, Role } from '../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';

@ApiTags('imports')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Roles(Role.ADMIN)
@Controller({ path: 'imports', version: '1' })
export class ImportsController {
  constructor(private readonly importsService: ImportsService) {}

  @Get()
  @ApiOperation({ summary: 'List all imports' })
  async findAll() {
    return this.importsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get import by ID' })
  async findOne(@Param('id') id: string) {
    return this.importsService.findOne(id);
  }

  @Post('upload')
  @ApiOperation({ summary: 'Upload import file' })
  async upload(@Body() body: any, @CurrentUser('id') userId: string) {
    return this.importsService.upload(body, userId);
  }

  @Post(':id/map-columns')
  @ApiOperation({ summary: 'Map source columns to system fields' })
  async mapColumns(
    @Param('id') id: string,
    @Body() body: { mapping: Record<string, string> },
  ) {
    return this.importsService.mapColumns(id, body.mapping);
  }

  @Post(':id/validate')
  @ApiOperation({ summary: 'Validate import data' })
  async validate(@Param('id') id: string) {
    return this.importsService.validate(id);
  }

  @Post(':id/confirm')
  @ApiOperation({ summary: 'Confirm and process import' })
  async confirm(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.importsService.confirm(id, userId);
  }
}
