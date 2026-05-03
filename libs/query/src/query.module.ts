import { Module } from '@nestjs/common';
import { DatabaseModule } from '@app/database';

import { NotificationQueryService } from './notification-query.service';

@Module({
  imports: [DatabaseModule],
  providers: [NotificationQueryService],
  exports: [NotificationQueryService],
})
export class QueryModule {}
