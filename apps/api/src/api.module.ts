import { Module } from '@nestjs/common';
import { ApiService } from './api.service';
import { DatabaseModule } from '@app/database';
import { NotificationsModule } from './notifications/notifications.module';
import { AuthModule } from '@app/auth';
import { AuthModule as AuthApiModule } from './auth/auth.module';
import { StatsModule } from './stats/stats.module';
import { MetricsModule } from './metrics/metrics.module';
import {HealthModule} from "./health/health.module";

@Module({
  imports: [
    DatabaseModule,
    NotificationsModule,
    AuthModule,
    AuthApiModule,
    StatsModule,
    MetricsModule,
    HealthModule,
  ],
  controllers: [],
  providers: [ApiService],
})
export class ApiModule {}
