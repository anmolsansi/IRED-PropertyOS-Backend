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
import { UnitsService } from './units.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { Roles, Role } from '../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation.pipe';
import {
  CreateUnitSchema,
  UpdateUnitSchema,
  UnitQuerySchema,
  CreateUnitDto,
  UpdateUnitDto,
  UnitQueryDto,
} from './dto/units.schema';

@ApiTags('units')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'units', version: '1' })
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @Get()
  @ApiOperation({ summary: 'List units with filters' })
  @UsePipes(new ZodValidationPipe(UnitQuerySchema))
  async findAll(@Query() query: UnitQueryDto) {
    return this.unitsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get unit by ID' })
  async findOne(@Param('id') id: string) {
    return this.unitsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new unit' })
  @UsePipes(new ZodValidationPipe(CreateUnitSchema))
  async create(@Body() dto: CreateUnitDto, @CurrentUser('id') userId: string) {
    return this.unitsService.create(dto, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a unit' })
  @UsePipes(new ZodValidationPipe(UpdateUnitSchema))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUnitDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
  ) {
    return this.unitsService.update(id, dto, userId, userRole === Role.ADMIN);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Soft delete a unit (Admin only)' })
  async softDelete(@Param('id') id: string) {
    return this.unitsService.softDelete(id);
  }

  @Post(':id/restore')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Restore a soft-deleted unit (Admin only)' })
  async restore(@Param('id') id: string) {
    return this.unitsService.restore(id);
  }
}
