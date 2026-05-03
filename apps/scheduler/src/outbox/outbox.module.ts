import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OutboxEvent } from '@app/database/entities/outbox-event.entity';
import { OutboxProcessor } from './outbox.processor';
import { OutboxCron } from './outbox.cron';
import { QueueModule } from '@app/queue';

@Module({
  imports: [TypeOrmModule.forFeature([OutboxEvent]), QueueModule],
  providers: [OutboxProcessor, OutboxCron],
})
export class OutboxModule {}
