import { Controller, Get, Module, ServiceUnavailableException } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { Public } from '../../common/decorators';
import { PrismaService } from '../../prisma/prisma.service';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Same relative depth from src/ and dist/, so this works in dev and production.
const { version } = JSON.parse(readFileSync(join(__dirname, '../../../package.json'), 'utf8')) as { version: string };

@ApiTags('Health')
@Controller('health')
@SkipThrottle()
class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Liveness + database readiness probe' })
  async check() {
    const started = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      throw new ServiceUnavailableException({ status: 'error', database: 'down' });
    }
    return {
      status: 'ok',
      service: 'terrava-backend',
      version,
      database: 'up',
      databaseLatencyMs: Date.now() - started,
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  }
}

@Module({ controllers: [HealthController] })
export class HealthModule {}
