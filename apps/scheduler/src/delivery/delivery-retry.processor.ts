import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { Delivery } from '@app/database/entities/delivery.entity';
import { OutboxEvent } from '@app/database/entities/outbox-event.entity';

import { DeliveryRow } from '@app/query/types/delivery.types';

@Injectable()
export class DeliveryRetryProcessor {
  private readonly batchSize = 50;

  constructor(private readonly dataSource: DataSource) {}

  async processBatch(): Promise<void> {
    const [deliveries] = await this.dataSource.query(
      `
                update deliveries set status = 'processing'
                where id in (
                    select id
                    from deliveries
                    where status = $1
                      and ("attempts" < "maxRetries")
                      and ("nextRetryAt" is null or "nextRetryAt" <= now())
                    order by "createdAt" asc
                            limit $2
                )
                returning *;
            `,
      ['failed', this.batchSize],
    );

    for (const delivery of deliveries) {
      await this.processOne(delivery);
    }
  }

  private async processOne(delivery: DeliveryRow): Promise<void> {
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
          status: 'processing',
          attempts,
          nextRetryAt,
        },
      );

      const event = queryRunner.manager.create(OutboxEvent, {
        type: 'delivery.retry',
        payload: {
          deliveryId: delivery.id,
          isRetry: true,
        },
      });

      await queryRunner.manager.save(event);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
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
