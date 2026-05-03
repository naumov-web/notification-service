import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import {
  Delivery,
  DeliveryStatusEnum,
} from '@app/database/entities/delivery.entity';
import {
  OutboxEvent,
  OutboxType,
} from '@app/database/entities/outbox-event.entity';

import { DeliveryRow } from '@app/query/types/delivery.types';

@Injectable()
export class DeliveryRetryProcessor {
  private readonly batchSize = 50;

  constructor(private readonly dataSource: DataSource) {}

  async processBatch(): Promise<void> {
    const raw = (await this.dataSource.query(
      `
                update deliveries set status = $1
                where id in (
                    select id
                    from deliveries
                    where status = $2
                      and ("attempts" < "maxRetries")
                      and ("nextRetryAt" is null or "nextRetryAt" <= now())
                    order by "createdAt" asc
                            limit $3
                )
                returning *;
            `,
      [
        DeliveryStatusEnum.PROCESSING,
        DeliveryStatusEnum.FAILED,
        this.batchSize,
      ],
    )) as unknown;
    const [deliveries] = raw as [DeliveryRow[], number];
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
            status: DeliveryStatusEnum.FAILED,
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
          status: DeliveryStatusEnum.PROCESSING,
          attempts,
          nextRetryAt,
        },
      );
      const event = queryRunner.manager.create(OutboxEvent, {
        type: OutboxType.DELIVERY_RETRY,
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
