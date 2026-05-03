import { Controller, Get } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Controller('health')
export class HealthController {
  constructor(private readonly dataSource: DataSource) {}

  @Get()
  async check() {
    const result: {
      status: string;
      timestamp: string;
      services: Record<string, string>;
    } = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {},
    };

    try {
      await this.dataSource.query('select 1');
      result.services = {
        ...result.services,
        database: 'up',
      };
    } catch {
      return {
        status: 'error',
        services: {
          database: 'down',
        },
      };
    }

    return result;
  }
}
