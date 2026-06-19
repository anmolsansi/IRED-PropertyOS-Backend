import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  PrismaHealthIndicator,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prisma: PrismaHealthIndicator,
    private memory: MemoryHealthIndicator,
    private prismaService: PrismaService,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Health check (database + memory)' })
  @ApiResponse({ status: 200, description: 'Health status', schema: { example: { status: 'ok', details: { database: { status: 'up' }, memory_rss: { status: 'up' } } } } })
  @ApiResponse({ status: 503, description: 'Service unhealthy' })
  check() {
    return this.health.check([
      () => this.prisma.pingCheck('database', this.prismaService),
      () => this.memory.checkRSS('memory_rss', 300 * 1024 * 1024),
    ]);
  }
}
