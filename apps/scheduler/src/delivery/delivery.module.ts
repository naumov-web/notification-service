import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Delivery } from '@app/database/entities/delivery.entity';
import { Notification } from '@app/database/entities/notification.entity';
import { DeliveryCron } from './delivery.cron';
import { DeliveryRetryProcessor } from './delivery-retry.processor';
import { QueryModule } from '@app/query';

@Module({
  imports: [TypeOrmModule.forFeature([Delivery, Notification]), QueryModule],
  providers: [DeliveryCron, DeliveryRetryProcessor],
  exports: [],
})
export class DeliveryModule {}
