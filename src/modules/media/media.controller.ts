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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MediaService } from './media.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { Roles, Role } from '../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { FileType } from '../../generated/prisma';

@ApiTags('media')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'media', version: '1' })
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get()
  @ApiOperation({ summary: 'List media files' })
  async findAll(
    @Query('buildingId') buildingId?: string,
    @Query('floorId') floorId?: string,
    @Query('unitId') unitId?: string,
  ) {
    if (buildingId) return this.mediaService.findByBuilding(buildingId);
    if (floorId) return this.mediaService.findByFloor(floorId);
    if (unitId) return this.mediaService.findByUnit(unitId);
    return [];
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get media by ID' })
  async findOne(@Param('id') id: string) {
    return this.mediaService.findOne(id);
  }

  @Get(':id/download-url')
  @ApiOperation({ summary: 'Get presigned download URL' })
  async getDownloadUrl(@Param('id') id: string) {
    return this.mediaService.getDownloadUrl(id);
  }

  @Post('upload-url')
  @ApiOperation({ summary: 'Get presigned upload URL' })
  async getUploadUrl(
    @Body()
    body: {
      fileName: string;
      mimeType: string;
      fileType: FileType;
      buildingId?: string;
      floorId?: string;
      unitId?: string;
      documentCategoryId?: string;
    },
  ) {
    return this.mediaService.getUploadUrl(body);
  }

  @Post('complete-upload')
  @ApiOperation({ summary: 'Mark upload as complete' })
  async completeUpload(
    @Body() body: { mediaId: string; fileSizeBytes?: number },
  ) {
    return this.mediaService.completeUpload(body.mediaId, body.fileSizeBytes);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update media metadata (Admin only)' })
  async update(
    @Param('id') id: string,
    @Body() body: { documentCategoryId?: string; notes?: string },
  ) {
    return this.mediaService.updateMetadata(id, body);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Soft delete media (Admin only)' })
  async softDelete(@Param('id') id: string) {
    return this.mediaService.softDelete(id);
  }

  @Post(':id/restore')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Restore soft-deleted media (Admin only)' })
  async restore(@Param('id') id: string) {
    return this.mediaService.restore(id);
  }
}
