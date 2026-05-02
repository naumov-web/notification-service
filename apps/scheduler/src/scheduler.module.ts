import { Module } from '@nestjs/common';
import { DatabaseModule } from '@app/database';
import { ScheduleModule } from '@nestjs/schedule';
import { OutboxModule } from './outbox/outbox.module';
import { DeliveryModule } from './delivery/delivery.module';

@Module({
  imports: [
    DatabaseModule,
    ScheduleModule.forRoot(),
    OutboxModule,
    DeliveryModule,
  ],
  controllers: [],
  providers: [],
})
export class SchedulerModule {}
