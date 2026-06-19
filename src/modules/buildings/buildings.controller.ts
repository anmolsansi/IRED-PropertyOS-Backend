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
import { BuildingsService } from './buildings.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { Roles, Role } from '../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation.pipe';
import {
  CreateBuildingSchema,
  UpdateBuildingSchema,
  BuildingQuerySchema,
  CreateBuildingDto,
  UpdateBuildingDto,
  BuildingQueryDto,
} from './dto/buildings.schema';

@ApiTags('buildings')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'buildings', version: '1' })
export class BuildingsController {
  constructor(private readonly buildingsService: BuildingsService) {}

  @Get()
  @ApiOperation({ summary: 'List buildings with filters' })
  @UsePipes(new ZodValidationPipe(BuildingQuerySchema))
  async findAll(@Query() query: BuildingQueryDto) {
    return this.buildingsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get building by ID' })
  async findOne(@Param('id') id: string) {
    return this.buildingsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new building' })
  @UsePipes(new ZodValidationPipe(CreateBuildingSchema))
  async create(@Body() dto: CreateBuildingDto, @CurrentUser('id') userId: string) {
    return this.buildingsService.create(dto, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a building' })
  @UsePipes(new ZodValidationPipe(UpdateBuildingSchema))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateBuildingDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
  ) {
    return this.buildingsService.update(
      id,
      dto,
      userId,
      userRole === Role.ADMIN,
    );
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Soft delete a building (Admin only)' })
  async softDelete(@Param('id') id: string) {
    return this.buildingsService.softDelete(id);
  }

  @Post(':id/restore')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Restore a soft-deleted building (Admin only)' })
  async restore(@Param('id') id: string) {
    return this.buildingsService.restore(id);
  }
}
