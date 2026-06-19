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
import { DealsService } from './deals.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { Roles, Role } from '../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation.pipe';
import {
  CreateDealSchema,
  UpdateDealSchema,
  AddCommissionSchema,
  AddInvoiceSchema,
  DealQuerySchema,
  CreateDealDto,
  UpdateDealDto,
  AddCommissionDto,
  AddInvoiceDto,
  DealQueryDto,
} from './dto/deals.schema';

@ApiTags('deals')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'deals', version: '1' })
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  @Get()
  @ApiOperation({ summary: 'List deals' })
  @UsePipes(new ZodValidationPipe(DealQuerySchema))
  async findAll(@Query() query: DealQueryDto) {
    return this.dealsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get deal by ID' })
  async findOne(@Param('id') id: string) {
    return this.dealsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new deal' })
  @UsePipes(new ZodValidationPipe(CreateDealSchema))
  async create(@Body() dto: CreateDealDto, @CurrentUser('id') userId: string) {
    return this.dealsService.create(dto, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a deal' })
  @UsePipes(new ZodValidationPipe(UpdateDealSchema))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateDealDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.dealsService.update(id, dto, userId);
  }

  @Post(':id/commissions')
  @ApiOperation({ summary: 'Add commission to a deal' })
  @UsePipes(new ZodValidationPipe(AddCommissionSchema))
  async addCommission(
    @Param('id') id: string,
    @Body() dto: AddCommissionDto,
  ) {
    return this.dealsService.addCommission(id, dto);
  }

  @Post(':id/invoices')
  @ApiOperation({ summary: 'Add invoice to a deal' })
  @UsePipes(new ZodValidationPipe(AddInvoiceSchema))
  async addInvoice(
    @Param('id') id: string,
    @Body() dto: AddInvoiceDto,
  ) {
    return this.dealsService.addInvoice(id, dto);
  }

  @Patch('invoices/:invoiceId/pay')
  @ApiOperation({ summary: 'Mark invoice as paid' })
  async markInvoicePaid(@Param('invoiceId') invoiceId: string) {
    return this.dealsService.markInvoicePaid(invoiceId);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Soft delete a deal (Admin only)' })
  async softDelete(@Param('id') id: string) {
    return this.dealsService.softDelete(id);
  }

  @Post(':id/restore')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Restore a soft-deleted deal (Admin only)' })
  async restore(@Param('id') id: string) {
    return this.dealsService.restore(id);
  }
}
