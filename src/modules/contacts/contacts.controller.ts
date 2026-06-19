import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ContactsService } from './contacts.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { Roles, Role } from '../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation.pipe';
import {
  CreateContactSchema,
  UpdateContactSchema,
  CreateContactDto,
  UpdateContactDto,
} from './dto/contacts.schema';

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
  @UsePipes(new ZodValidationPipe(CreateContactSchema))
  async create(@Body() dto: CreateContactDto, @CurrentUser('id') userId: string) {
    return this.contactsService.create(dto, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a contact' })
  @UsePipes(new ZodValidationPipe(UpdateContactSchema))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateContactDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
  ) {
    return this.contactsService.update(
      id,
      dto,
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
