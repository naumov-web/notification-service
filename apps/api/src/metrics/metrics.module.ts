import { Module } from '@nestjs/common';
import { MetricsController } from './metrics.controller';
import { MetricsModule as MetricsCoreModule } from '@app/metrics';

@Module({
  imports: [MetricsCoreModule],
  providers: [],
  controllers: [MetricsController],
})
export class MetricsModule {}
