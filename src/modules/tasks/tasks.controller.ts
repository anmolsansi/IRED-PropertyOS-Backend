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
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';

@ApiTags('tasks')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'tasks', version: '1' })
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @ApiOperation({ summary: 'List tasks' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('assignedTo') assignedTo?: string,
    @Query('status') status?: string,
  ) {
    return this.tasksService.findAll({ page, limit, assignedTo, status });
  }

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  async create(@Body() body: any, @CurrentUser('id') userId: string) {
    return this.tasksService.create(body, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a task' })
  async update(@Param('id') id: string, @Body() body: any) {
    return this.tasksService.update(id, body);
  }
}
