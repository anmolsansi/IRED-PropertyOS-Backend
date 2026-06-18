import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProposalsService } from './proposals.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';

@ApiTags('proposals')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'proposals', version: '1' })
export class ProposalsController {
  constructor(private readonly proposalsService: ProposalsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new proposal' })
  async create(@Body() body: any, @CurrentUser('id') userId: string) {
    return this.proposalsService.create(body, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get proposal by ID' })
  async findOne(@Param('id') id: string) {
    return this.proposalsService.findOne(id);
  }

  @Post(':id/generate-pdf')
  @ApiOperation({ summary: 'Generate PDF for proposal' })
  async generatePdf(@Param('id') id: string) {
    return this.proposalsService.generatePdf(id);
  }

  @Post(':id/generate-xlsx')
  @ApiOperation({ summary: 'Generate XLSX for proposal' })
  async generateXlsx(@Param('id') id: string) {
    return this.proposalsService.generateXlsx(id);
  }

  @Post(':id/send-email')
  @ApiOperation({ summary: 'Send proposal via email' })
  async sendEmail(@Param('id') id: string, @Body() body: any) {
    return this.proposalsService.sendEmail(id, body);
  }
}
