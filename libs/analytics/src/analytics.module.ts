import { Module } from '@nestjs/common';
import {ClickHouseProvider} from "@app/analytics/clickhouse.provider";

@Module({
  providers: [ClickHouseProvider],
  exports: [ClickHouseProvider],
})
export class AnalyticsModule {}
