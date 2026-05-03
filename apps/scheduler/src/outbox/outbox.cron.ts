import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { OutboxProcessor } from './outbox.processor';

@Injectable()
export class OutboxCron {
  constructor(private readonly processor: OutboxProcessor) {}

  @Cron('*/5 * * * * *')
  async handle() {
    await this.processor.processBatch();
  }
}
