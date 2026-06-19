import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  Res,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { ProposalsService } from './proposals.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { Roles, Role } from '../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation.pipe';
import {
  CreateProposalSchema,
  CreateProposalDto,
} from './dto/proposals.schema';

@ApiTags('proposals')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'proposals', version: '1' })
export class ProposalsController {
  constructor(private readonly proposalsService: ProposalsService) {}

  @Get()
  @ApiOperation({ summary: 'List all proposals' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('clientId') clientId?: string,
  ) {
    return this.proposalsService.findAll({ page, limit, clientId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get proposal by ID' })
  async findOne(@Param('id') id: string) {
    return this.proposalsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a proposal for a client' })
  @UsePipes(new ZodValidationPipe(CreateProposalSchema))
  async create(
    @Body() dto: CreateProposalDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.proposalsService.create(dto, userId);
  }

  @Post(':id/generate-pdf')
  @ApiOperation({ summary: 'Generate PDF for a proposal' })
  async generatePdf(
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const buffer = await this.proposalsService.generatePdf(id);
    const fileName = `proposal-${id}.pdf`;
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    });
    res.end(buffer);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update proposal status (Admin only)' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.proposalsService.updateStatus(id, status as any);
  }
}
