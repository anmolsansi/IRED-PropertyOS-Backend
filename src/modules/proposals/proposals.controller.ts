import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Res,
  UseGuards,
  Header,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
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
  @ApiOperation({ summary: 'Create a proposal for a client' })
  async create(
    @Body() body: { clientId: string; requirementId?: string; unitIds: string[]; notes?: string },
    @CurrentUser('id') userId: string,
  ) {
    return this.proposalsService.create(body, userId);
  }

  @Post('generate-pdf')
  @ApiOperation({ summary: 'Generate PDF for a proposal' })
  @Header('Content-Type', 'application/pdf')
  async generatePdf(
    @Body() body: { client: any; units: any[]; notes?: string },
    @Res() res: Response,
  ) {
    const { buffer, fileName } = await this.proposalsService.generateAndStorePdf(body);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    });
    res.end(buffer);
  }
}
