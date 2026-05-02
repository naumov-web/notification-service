import { Module } from '@nestjs/common';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { AnalyticsModule } from '@app/analytics';

@Module({
  imports: [AnalyticsModule],
  providers: [StatsService],
  controllers: [StatsController],
})
export class StatsModule {}
