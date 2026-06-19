import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  UsePipes,
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
import { ZodValidationPipe } from '../../shared/pipes/zod-validation.pipe';
import { MapColumnsSchema, MapColumnsDto } from './dto/imports.schema';
import { parseCsvFile } from '../../shared/utils/csv-parser';

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

    const rows = parseCsvFile(file.buffer.toString());
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
  @UsePipes(new ZodValidationPipe(MapColumnsSchema))
  async mapColumns(
    @Param('id') id: string,
    @Body() dto: MapColumnsDto,
  ) {
    return this.importsService.mapColumns(id, dto.mapping);
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
