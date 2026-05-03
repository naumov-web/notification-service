import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DeliveryRetryProcessor } from './delivery-retry.processor';

@Injectable()
export class DeliveryCron {
  constructor(private readonly processor: DeliveryRetryProcessor) {}

  @Cron('*/5 * * * * *')
  async handle() {
    await this.processor.processBatch();
  }
}
