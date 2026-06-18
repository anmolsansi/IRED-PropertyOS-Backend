import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ClientsService } from './clients.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';

@ApiTags('clients')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'clients', version: '1' })
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  @ApiOperation({ summary: 'List clients' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.clientsService.findAll({ page, limit, search });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get client by ID' })
  async findOne(@Param('id') id: string) {
    return this.clientsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new client' })
  async create(@Body() body: any, @CurrentUser('id') userId: string) {
    return this.clientsService.create(body, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a client' })
  async update(@Param('id') id: string, @Body() body: any) {
    return this.clientsService.update(id, body);
  }
}
