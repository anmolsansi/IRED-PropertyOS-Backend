import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { Roles, Role } from '../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation.pipe';
import {
  InviteUserSchema,
  UpdateUserStatusSchema,
  AssignGeographicScopeSchema,
  ReassignUnitsSchema,
  UserQuerySchema,
  InviteUserDto,
  UpdateUserStatusDto,
  AssignGeographicScopeDto,
  ReassignUnitsDto,
  UserQueryDto,
} from './dto/users.schema';

@ApiTags('users')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'List all users (Admin only)' })
  @UsePipes(new ZodValidationPipe(UserQuerySchema))
  async findAll(@Query() query: UserQueryDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post('invite')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Invite a new worker (Admin only)' })
  @UsePipes(new ZodValidationPipe(InviteUserSchema))
  async invite(@Body() dto: InviteUserDto) {
    return this.usersService.invite(dto);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update user status (Admin only)' })
  @UsePipes(new ZodValidationPipe(UpdateUserStatusSchema))
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusDto,
  ) {
    return this.usersService.updateStatus(id, dto.status);
  }

  @Post(':id/geographic-assignments')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Assign geographic scope to a worker (Admin only)' })
  @UsePipes(new ZodValidationPipe(AssignGeographicScopeSchema))
  async assignGeographicScope(
    @Param('id') id: string,
    @Body() dto: AssignGeographicScopeDto,
  ) {
    return this.usersService.assignGeographicScope(id, dto.assignments);
  }

  @Post('reassign-units')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Reassign units from one worker to another (Admin only)' })
  @UsePipes(new ZodValidationPipe(ReassignUnitsSchema))
  async reassignUnits(@Body() dto: ReassignUnitsDto) {
    return this.usersService.reassignUnits(dto.fromWorkerId, dto.toWorkerId);
  }

  @Post(':id/reset-password')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Reset user password (Admin only)' })
  async resetPassword(@Param('id') id: string) {
    return this.usersService.resetPassword(id);
  }
}
