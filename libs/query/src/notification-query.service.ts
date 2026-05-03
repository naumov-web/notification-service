import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';

import {
  NotificationDetails,
  NotificationRow,
  DeliveryRow,
  CountRow,
} from './types/notification.types';

@Injectable()
export class NotificationQueryService {
  constructor(private readonly dataSource: DataSource) {}

  async getDetails(id: string): Promise<NotificationDetails> {
    const result = (await this.dataSource.query(
      `
            select id, "userId", "eventType", status, "createdAt"
            from notifications
            where id = $1
            limit 1
            `,
      [id],
    )) as unknown;
    const notifications = result as NotificationRow[];

    if (!notifications.length) {
      throw new NotFoundException('Notification not found.');
    }

    const notification = notifications[0];
    const deliveryResult = (await this.dataSource.query(
      `
            select id, channel, status, target, "createdAt"
            from deliveries
            where "notificationId" = $1
            order by "createdAt" asc
            `,
      [id],
    )) as unknown;
    const deliveries = deliveryResult as DeliveryRow[];

    return {
      notification,
      deliveries,
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
    const { limit, offset, userId, eventType, status, sortBy, order } = params;
    const values: unknown[] = [];
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

    const allowedSort: Array<'eventType' | 'status' | 'createdAt'> = [
      'eventType',
      'status',
      'createdAt',
    ];

    const sortColumn = allowedSort.includes(sortBy)
      ? `"${sortBy}"`
      : `"createdAt"`;

    const sortOrder = order === 'asc' ? 'asc' : 'desc';
    const countRaw = (await this.dataSource.query(
      `
      select count(*)::int as count
      from notifications
      ${whereSql}
    `,
      values,
    )) as unknown;

    const countRows = countRaw as CountRow[];
    values.push(isNaN(limit) ? 20 : limit, isNaN(offset) ? 0 : offset);
    const itemsRaw = (await this.dataSource.query(
      `
        select id, "userId", "eventType", status, "createdAt"
        from notifications
        ${whereSql}
        order by ${sortColumn} ${sortOrder}
        limit $${values.length - 1}
        offset $${values.length}
      `,
      values,
    )) as unknown;

    const items = itemsRaw as NotificationRow[];

    return {
      count: countRows[0]?.count ?? 0,
      items,
    };
  }
}
