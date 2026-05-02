import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import {
    DeliveryRow,
    DeliveryStats,
} from './types/delivery.types';

type RawDeliveryRow = {
    id: string;
    notificationId: string;

    channel: string;
    target: string;
    renderedBody: string;

    status: string;

    attempts: number | string;
    maxRetries: number | string;

    nextRetryAt: string | null;

    createdAt: string;
    updatedAt: string;
};

@Injectable()
export class DeliveryQueryService {
    constructor(private readonly dataSource: DataSource) {}

    /**
     * Батч для обработки (retry / initial)
     */
    async getProcessableBatch(limit: number): Promise<DeliveryRow[]> {
        const rows: RawDeliveryRow[] = await this.dataSource.query(
            `
      select *
      from deliveries
      where status in ($1, $2)
        and ("attempts" < "maxRetries")
        and ("nextRetryAt" is null or "nextRetryAt" <= now())
      order by "createdAt" asc
      limit $3
      `,
            ['pending', 'failed', limit],
        );

        return rows.map((r) => this.mapRow(r));
    }

    /**
     * Все доставки по notification
     */
    async getByNotificationId(
        notificationId: string,
    ): Promise<DeliveryRow[]> {
        const rows: RawDeliveryRow[] = await this.dataSource.query(
            `
      select *
      from deliveries
      where "notificationId" = $1
      `,
            [notificationId],
        );

        return rows.map((r) => this.mapRow(r));
    }

    /**
     * Все отправлены?
     */
    async isAllSent(notificationId: string): Promise<boolean> {
        const result: { count: string }[] =
            await this.dataSource.query(
                `
        select count(*) as count
        from deliveries
        where "notificationId" = $1
          and status != $2
        `,
                [notificationId, 'sent'],
            );

        return Number(result[0].count) === 0;
    }

    /**
     * Есть ли failed?
     */
    async hasFailed(notificationId: string): Promise<boolean> {
        const result: unknown[] = await this.dataSource.query(
            `
      select 1
      from deliveries
      where "notificationId" = $1
        and status = $2
      limit 1
      `,
            [notificationId, 'failed'],
        );

        return result.length > 0;
    }

    /**
     * Агрегированная статистика
     */
    async getStats(notificationId: string): Promise<DeliveryStats> {
        const result: {
            sent: string;
            failed: string;
            pending: string;
        }[] = await this.dataSource.query(
            `
      select
        count(*) filter (where status = 'sent') as sent,
        count(*) filter (where status = 'failed') as failed,
        count(*) filter (where status = 'pending') as pending
      from deliveries
      where "notificationId" = $1
      `,
            [notificationId],
        );

        return {
            sent: Number(result[0].sent),
            failed: Number(result[0].failed),
            pending: Number(result[0].pending),
        };
    }

    /**
     * Маппинг raw → typed
     */
    private mapRow(row: RawDeliveryRow): DeliveryRow {
        return {
            id: row.id,
            notificationId: row.notificationId,

            channel: row.channel,
            target: row.target,
            renderedBody: row.renderedBody,

            status: row.status as DeliveryRow['status'],

            attempts: Number(row.attempts),
            maxRetries: Number(row.maxRetries),

            nextRetryAt: row.nextRetryAt
                ? new Date(row.nextRetryAt)
                : null,

            createdAt: new Date(row.createdAt),
            updatedAt: new Date(row.updatedAt),
        };
    }
}