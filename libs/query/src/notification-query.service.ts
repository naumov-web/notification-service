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

    async list(params: {
        limit: number;
        offset: number;
        userId?: string;
        eventType?: string;
        status?: string;
        sortBy: 'eventType' | 'status' | 'createdAt';
        order: 'asc' | 'desc';
    }) {
        const {
            limit,
            offset,
            userId,
            eventType,
            status,
            sortBy,
            order,
        } = params;

        const values: any[] = [];
        const where: string[] = [];

        if (userId) {
            values.push(userId);
            where.push(`"userId" = $${values.length}`);
        }

        if (eventType) {
            values.push(eventType);
            where.push(`"eventType" = $${values.length}`);
        }

        if (status) {
            values.push(status);
            where.push(`status = $${values.length}`);
        }

        const whereSql = where.length ? `where ${where.join(' and ')}` : '';

        const allowedSort = ['eventType', 'status', 'createdAt'];
        const sortColumn = allowedSort.includes(sortBy)
            ? `"${sortBy}"`
            : `"createdAt"`;

        const sortOrder = order === 'asc' ? 'asc' : 'desc';
        const countResult = await this.dataSource.query(
            `
            select count(*)::int as count
            from notifications
            ${whereSql}
            `,
            values,
        );
        values.push(
            isNaN(limit) ? 20 : limit,
            isNaN(offset) ? 0 : offset
        );

        const items = await this.dataSource.query(
            `
            select id, "userId", "eventType", status, "createdAt"
            from notifications
            ${whereSql}
            order by ${sortColumn} ${sortOrder}
            limit $${values.length - 1}
            offset $${values.length}
            `,
            values,
        );

        return {
            count: countResult[0].count,
            items,
        };
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