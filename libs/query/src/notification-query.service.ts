import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import {
    NotificationRow,
    NotificationDetails,
} from './types/notification.types';

type RawNotificationRow = {
    id: string;
    userId: string;
    eventType: string;
    parameters: any;
    status: string;
    createdAt: string;
    updatedAt: string;
};

@Injectable()
export class NotificationQueryService {
    constructor(private readonly dataSource: DataSource) {}

    /**
     * Получить одну notification
     */
    async getById(id: string): Promise<NotificationRow | null> {
        const rows: RawNotificationRow[] = await this.dataSource.query(
            `
      select *
      from notifications
      where id = $1
      limit 1
      `,
            [id],
        );

        if (!rows.length) return null;

        return this.mapRow(rows[0]);
    }

    /**
     * Полная информация (notification + deliveries + stats)
     */
    async getDetails(id: string): Promise<NotificationDetails | null> {
        const notification = await this.getById(id);

        if (!notification) return null;

        const deliveries = await this.dataSource.query(
            `
      select id, channel, status, target
      from deliveries
      where "notificationId" = $1
      `,
            [id],
        );

        const statsResult = await this.dataSource.query(
            `
      select
        count(*) as total,
        count(*) filter (where status = 'sent') as sent,
        count(*) filter (where status = 'failed') as failed,
        count(*) filter (where status = 'pending') as pending
      from deliveries
      where "notificationId" = $1
      `,
            [id],
        );

        return {
            notification,
            deliveries,
            stats: {
                total: Number(statsResult[0].total),
                sent: Number(statsResult[0].sent),
                failed: Number(statsResult[0].failed),
                pending: Number(statsResult[0].pending),
            },
        };
    }

    /**
     * Список notifications (например для API)
     */
    async list(limit = 20, offset = 0): Promise<NotificationRow[]> {
        const rows: RawNotificationRow[] = await this.dataSource.query(
            `
      select *
      from notifications
      order by "createdAt" desc
      limit $1 offset $2
      `,
            [limit, offset],
        );

        return rows.map((r) => this.mapRow(r));
    }

    /**
     * Маппинг raw → typed
     */
    private mapRow(row: RawNotificationRow): NotificationRow {
        return {
            id: row.id,
            userId: row.userId,
            eventType: row.eventType,
            parameters: row.parameters,
            status: row.status as NotificationRow['status'],
            createdAt: new Date(row.createdAt),
            updatedAt: new Date(row.updatedAt),
        };
    }
}