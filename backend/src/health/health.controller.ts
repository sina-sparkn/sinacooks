import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service.js';

@ApiTags('health')
@Controller('health')
export class HealthController {
  private readonly strapiUrl: string;

  constructor(
    private readonly health: HealthCheckService,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.strapiUrl = this.config.get<string>(
      'cms.strapiUrl',
      'http://localhost:1337',
    );
  }

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Health check endpoint' })
  async check() {
    return this.health.check([
      // Database reachability check
      async () => {
        try {
          await this.prisma.$queryRaw`SELECT 1`;
          return { database: { status: 'up' } };
        } catch {
          return { database: { status: 'down' } };
        }
      },
      // CMS reachability check using built-in fetch
      async () => {
        try {
          const res = await fetch(`${this.strapiUrl}/_health`, {
            signal: AbortSignal.timeout(3000),
          });
          return { cms: { status: res.ok ? 'up' : 'down' } };
        } catch {
          return { cms: { status: 'down' } };
        }
      },
    ]);
  }
}
