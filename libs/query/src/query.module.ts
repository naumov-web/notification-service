import { Module } from '@nestjs/common';
import { DatabaseModule } from '@app/database';

import { DeliveryQueryService } from './delivery-query.service';
import { NotificationQueryService } from './notification-query.service';

@Module({
  imports: [DatabaseModule],
  providers: [
    DeliveryQueryService,
    NotificationQueryService,
  ],
  exports: [
    DeliveryQueryService,
    NotificationQueryService,
  ],
})
export class QueryModule {}