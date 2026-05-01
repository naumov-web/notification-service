import {Injectable} from "@nestjs/common";
import { DataSource } from 'typeorm';
import {Delivery} from "@app/database/entities/delivery.entity";
import {OutboxEvent} from "@app/database/entities/outbox-event.entity";

@Injectable()
export class DeliveryRetryProcessor {
    constructor(
        private readonly dataSource: DataSource
    ) {}

    async processBatch(limit = 50) {
        const [deliveries] = await this.dataSource.query(
            `
              update deliveries
              set status = $1
              where id in (
                select id
                from deliveries
                where status in ($2, $3)
                  and ("attempts" < "maxRetries")
                  and ("nextRetryAt" is null or "nextRetryAt" <= now())
                order by "createdAt" asc
                for update skip locked
                limit $4
              )
              returning *;
              `,
            [
                'processing',
                'pending',
                'failed',
                limit,
            ],
        );

        for (const d of deliveries) {
            await this.processOne(d);
        }
    }

    private async processOne(delivery: Delivery) {
        const attempts = (delivery.attempts ?? 0) + 1;

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            if (attempts >= delivery.maxRetries) {
                await queryRunner.manager.update(
                    Delivery,
                    { id: delivery.id },
                    {
                        status: 'failed',
                        attempts,
                    },
                );

                await queryRunner.commitTransaction();
                return;
            }

            const nextRetryAt = this.calculateNextRetry(attempts);

            await queryRunner.manager.update(
                Delivery,
                { id: delivery.id },
                {
                    status: 'pending',
                    attempts,
                    nextRetryAt,
                },
            );

            const outboxEvent = queryRunner.manager.create(OutboxEvent, {
                type: 'notification.created',
                payload: {
                    notificationId: delivery.notificationId,
                },
            });

            await queryRunner.manager.save(outboxEvent);

            await queryRunner.commitTransaction();
        } catch (e) {
            await queryRunner.rollbackTransaction();
            throw e;
        } finally {
            await queryRunner.release();
        }
    }

    private calculateNextRetry(attempts: number): Date {
        const delays = [10, 30, 60, 300];
        const delay = delays[Math.min(attempts - 1, delays.length - 1)];

        return new Date(Date.now() + delay * 1000);
    }
}