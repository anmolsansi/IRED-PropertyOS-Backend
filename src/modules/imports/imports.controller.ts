import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Upload and parse import file' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('entityType') entityType: string,
    @CurrentUser('id') userId: string,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');

    const rows = this.parseCsvFile(file.buffer.toString());
    return this.importsService.upload(
      {
        fileName: file.originalname,
        fileType: file.mimetype,
        entityType,
        rows,
      },
      userId,
    );
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

  private parseCsvFile(content: string): { rowNumber: number; data: Record<string, string> }[] {
    const lines = content.split('\n').filter((l) => l.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map((h) => h.trim().replace(/"/g, ''));
    const rows: { rowNumber: number; data: Record<string, string> }[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim().replace(/"/g, ''));
      const data: Record<string, string> = {};
      headers.forEach((header, idx) => {
        data[header] = values[idx] || '';
      });
      rows.push({ rowNumber: i, data });
    }

    return rows;
  }
}
