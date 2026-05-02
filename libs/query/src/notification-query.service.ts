import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { NotificationDetails } from './types/notification.types';

@Injectable()
export class NotificationQueryService {
  constructor(private readonly dataSource: DataSource) {}

  async getDetails(id: string): Promise<NotificationDetails> {
    const notifications = await this.dataSource.query(
      `
            select id, "userId", "eventType", status, "createdAt"
            from notifications
            where id = $1
            limit 1
            `,
      [id],
    );

    if (!notifications.length) {
      throw new NotFoundException('Notification not found.');
    }

    const notification = notifications[0];

    // 2. deliveries
    const deliveries = await this.dataSource.query(
      `
            select id, channel, status, target, "createdAt"
            from deliveries
            where "notificationId" = $1
            order by "createdAt" asc
            `,
      [id],
    );

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
    values.push(isNaN(limit) ? 20 : limit, isNaN(offset) ? 0 : offset);

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
}
