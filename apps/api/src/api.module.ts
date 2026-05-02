import { Module } from '@nestjs/common';
import { ApiService } from './api.service';
import { DatabaseModule } from '@app/database';
import {NotificationsModule} from "./notifications/notifications.module";
import { AuthModule } from '@app/auth';
import { AuthModule as AuthApiModule } from "./auth/auth.module"
import { StatsModule } from "./stats/stats.module";
import {MetricsModule} from "./metrics/metrics.module";

@Module({
  imports: [DatabaseModule, NotificationsModule, AuthModule, AuthApiModule, StatsModule, MetricsModule ],
  controllers: [],
  providers: [ApiService],
})
export class ApiModule {}
