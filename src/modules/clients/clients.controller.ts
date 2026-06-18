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

  @Post(':id/contacts')
  @ApiOperation({ summary: 'Add a contact to a client' })
  async addContact(@Param('id') id: string, @Body() body: any) {
    return this.clientsService.addContact(id, body);
  }

  @Delete(':clientId/contacts/:contactId')
  @ApiOperation({ summary: 'Remove a contact from a client' })
  async removeContact(@Param('contactId') contactId: string) {
    return this.clientsService.removeContact(contactId);
  }

  @Post(':id/requirements')
  @ApiOperation({ summary: 'Create a requirement for a client' })
  async createRequirement(
    @Param('id') id: string,
    @Body() body: any,
    @CurrentUser('id') userId: string,
  ) {
    return this.clientsService.createRequirement(id, body, userId);
  }

  @Patch('requirements/:reqId')
  @ApiOperation({ summary: 'Update a requirement' })
  async updateRequirement(
    @Param('reqId') reqId: string,
    @Body() body: any,
  ) {
    return this.clientsService.updateRequirement(reqId, body);
  }

  @Post('requirements/:reqId/shortlists')
  @ApiOperation({ summary: 'Add a shortlist to a requirement' })
  async addShortlist(
    @Param('reqId') reqId: string,
    @Body() body: any,
  ) {
    return this.clientsService.addShortlist(reqId, body);
  }

  @Patch('shortlists/:shortlistId')
  @ApiOperation({ summary: 'Update a shortlist status' })
  async updateShortlist(
    @Param('shortlistId') shortlistId: string,
    @Body() body: any,
  ) {
    return this.clientsService.updateShortlist(shortlistId, body);
  }
}
