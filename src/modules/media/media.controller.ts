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

@ApiTags('media')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'media', version: '1' })
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get()
  @ApiOperation({ summary: 'List media files' })
  async findAll(@Query('buildingId') buildingId?: string) {
    if (buildingId) {
      return this.mediaService.findByBuilding(buildingId);
    }
    return [];
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get media by ID' })
  async findOne(@Param('id') id: string) {
    return this.mediaService.findOne(id);
  }

  @Post('upload-url')
  @ApiOperation({ summary: 'Get presigned upload URL' })
  async getUploadUrl(@Body() body: any, @CurrentUser('id') userId: string) {
    // TODO: Implement S3 presigned URL generation
    return { message: 'Not implemented', userId };
  }

  @Post('complete-upload')
  @ApiOperation({ summary: 'Mark upload as complete' })
  async completeUpload(@Body() body: { mediaId: string }) {
    return this.mediaService.completeUpload(body.mediaId);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update media metadata (Admin only)' })
  async update(@Param('id') id: string, @Body() body: any) {
    // TODO: Implement media metadata update
    return { message: 'Not implemented' };
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
