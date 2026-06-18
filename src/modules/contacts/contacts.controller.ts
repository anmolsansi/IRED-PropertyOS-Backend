import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ContactsService } from './contacts.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { Roles, Role } from '../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';

@ApiTags('contacts')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'contacts', version: '1' })
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get contact by ID' })
  async findOne(@Param('id') id: string) {
    return this.contactsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new contact' })
  async create(@Body() body: any, @CurrentUser('id') userId: string) {
    return this.contactsService.create(body, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a contact' })
  async update(
    @Param('id') id: string,
    @Body() body: any,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
  ) {
    return this.contactsService.update(
      id,
      body,
      userId,
      userRole === Role.ADMIN,
    );
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Soft delete a contact (Admin only)' })
  async softDelete(@Param('id') id: string) {
    return this.contactsService.softDelete(id);
  }

  @Post(':id/restore')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Restore a soft-deleted contact (Admin only)' })
  async restore(@Param('id') id: string) {
    return this.contactsService.restore(id);
  }

  @Post(':id/view-log')
  @ApiOperation({ summary: 'Log contact view for audit' })
  async logView(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.contactsService.logView(id, userId);
  }
}
