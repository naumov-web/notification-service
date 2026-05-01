import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

import {
    OutboxEvent,
    OutboxStatus,
} from '@app/database/entities/outbox-event.entity';

import { RabbitMQService } from '@app/queue/rabbitmq.service';

@Injectable()
export class OutboxProcessor {
    private readonly logger = new Logger(OutboxProcessor.name);

    private readonly maxRetries = 5;
    private readonly batchSize = 50;

    constructor(
        private readonly dataSource: DataSource,
        private readonly rabbit: RabbitMQService,
    ) {}

    async processBatch() {
        const [events] = await this.lockBatch(this.batchSize);

        for (const event of events) {
            await this.processEvent(event);
        }
    }

    private async lockBatch(limit: number): Promise<[OutboxEvent[], number]> {
        return this.dataSource.query(
            `update outbox_events
                set status = $1
                where id in (
                    select id
                    from outbox_events
                    where status in ($2, $3)
                      and ("nextRetryAt" is null or "nextRetryAt" <= now())
                    order by "createdAt" asc
                    for update skip locked
                    limit $4
                )
            returning *;
            `,
            [
                OutboxStatus.PROCESSING,
                OutboxStatus.PENDING,
                OutboxStatus.FAILED,
                limit,
            ],
        );
    }

    private async processEvent(event: OutboxEvent) {
        try {
            await this.publish(event);
            await this.markProcessed(event.id);
        } catch (err) {
            this.logger.error(`failed event ${event.id}`, err);
            await this.handleFailure(event);
        }
    }

    private async publish(event: OutboxEvent) {
        await this.rabbit.publish(event.type, event.payload);
    }

    private async markProcessed(id: string) {
        await this.dataSource.query(
            `update outbox_events
              set status = $1
              where id = $2
              `,
            [
                OutboxStatus.PROCESSED,
                id,
            ],
        );
    }

    private async handleFailure(event: OutboxEvent) {
        const attempts = event.attempts + 1;

        if (attempts >= this.maxRetries) {
            await this.dataSource.query(
                `update outbox_events
                set status = $1,
                    attempts = $2
                where id = $3
                `,
                [
                    OutboxStatus.FAILED,
                    attempts,
                    event.id,
                ],
            );

            return;
        }

        const nextRetryAt = this.calculateNextRetry(attempts);

        await this.dataSource.query(
            `update outbox_events
                set status = $1,
                    attempts = $2,
                    "nextRetryAt" = $3
                where id = $4
            `,
            [
                OutboxStatus.PENDING,
                attempts,
                nextRetryAt,
                event.id,
            ],
        );
    }

    private calculateNextRetry(attempts: number): Date {
        const delays = [10, 60, 300, 900];

        const delay = delays[Math.min(attempts - 1, delays.length - 1)];

        return new Date(Date.now() + delay * 1000);
    }
}